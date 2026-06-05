import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server"; 
import { enforceAdminCheck } from "@/lib/supabase/auth-guard";
import { revalidatePath } from "next/cache";

// POST: Add a Team Member
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();

  // Enforce global admin check
  const guard = await enforceAdminCheck(supabase);
  if (!guard.authorized) return guard.errorResponse;

  try {
    const data = await request.json();

    if (!data.is_existing_member) {
      if (data.phone && data.phone.length !== 10) {
        return NextResponse.json({ error: "Phone number must be exactly 10 digits." }, { status: 400 });
      }
      if (data.roll_number && data.roll_number.length !== 8) {
        return NextResponse.json({ error: "Roll number must be exactly 8 digits." }, { status: 400 });
      }
    }

    let finalMemberId = data.member_id;
    const isProfileActive = data.is_active ?? true;

    if (!data.is_existing_member) {
      const { data: profileRow, error: profileError } = await supabase
        .from("team_members")
        .upsert(
          {
            name: data.name,
            email: data.email,
            phone: data.phone,
            roll_number: data.roll_number || null,
            branch: data.branch,
            instagram: data.instagram,
            photo_url: data.photo_url,
            year: data.year || 1,
            domain: data.domain || "musician",
            role: data.role || "Member",
            is_active: isProfileActive,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "roll_number" }
        )
        .select("id")
        .single();

      if (profileError || !profileRow) {
        return NextResponse.json({ error: profileError?.message || "Could not retrieve member ID." }, { status: 500 });
      }
      finalMemberId = profileRow.id;
    } else if (data.is_existing_member && finalMemberId) {
      const { error: profileStatusError } = await supabase
        .from("team_members")
        .update({
          is_active: isProfileActive,
          year: data.year || 1,
          domain: data.domain || "musician",
          role: data.role || "Member",
          updated_at: new Date().toISOString(),
        })
        .eq("id", finalMemberId);

      if (profileStatusError) {
        return NextResponse.json({ error: profileStatusError.message }, { status: 500 });
      }
    }

    const { error: membershipError } = await supabase
      .from("club_memberships")
      .upsert(
        {
          member_id: finalMemberId,
          academic_year: data.academic_year,
          year_of_study: data.year || 1,
        },
        { onConflict: "member_id,academic_year" }
      );

    if (membershipError) {
      return NextResponse.json({ error: membershipError.message }, { status: 500 });
    }

    // Purge the stale CDN and browser caching segments instantly
    revalidatePath("/admin/dashboard");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: Update an Existing Team Member
export async function PUT(request: Request) {
  const supabase = await createServerSupabaseClient();

  // Enforce global admin check
  const guard = await enforceAdminCheck(supabase);
  if (!guard.authorized) return guard.errorResponse;

  try {
    const { id, data } = await request.json();
    const isMemberActive = data.is_active === true || data.is_active === "true";

    const profileUpdates = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      roll_number: data.roll_number,
      branch: data.branch,
      year: Number(data.year),
      domain: data.domain,
      role: data.role,
      instagram: data.instagram,
      photo_url: data.photo_url,
      is_active: isMemberActive,
      updated_at: new Date().toISOString(),
    };

    const membershipUpdates = {
      academic_year: data.academic_year,
    };

    const [profileResult, membershipResult] = await Promise.all([
      supabase.from("team_members").update(profileUpdates).eq("id", id),
      supabase.from("club_memberships").update(membershipUpdates).eq("id", data.membership_id),
    ]);

    if (profileResult.error || membershipResult.error) {
      const errMsg = profileResult.error?.message || membershipResult.error?.message;
      return NextResponse.json({ error: errMsg }, { status: 500 });
    }

    // Purge the stale CDN and browser caching segments instantly
    revalidatePath("/admin/dashboard");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Remove Membership from Current Team Roster
export async function DELETE(request: Request) {
  const supabase = await createServerSupabaseClient();

  // Enforce global admin check
  const guard = await enforceAdminCheck(supabase);
  if (!guard.authorized) return guard.errorResponse;

  const { searchParams } = new URL(request.url);
  const membershipId = searchParams.get("membershipId");

  if (!membershipId) {
    return NextResponse.json({ error: "Membership ID is required" }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from("club_memberships")
      .delete()
      .eq("id", membershipId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Purge the stale CDN and browser caching segments instantly
    revalidatePath("/admin/dashboard");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Migrate Team Roster to Historical Record
export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient();

  // Enforce global admin check
  const guard = await enforceAdminCheck(supabase);
  if (!guard.authorized) return guard.errorResponse;

  try {
    const { teamMembers, currentActiveAcademicYearStr, targetHistoryYearLabel } = await request.json();

    const historicalSnapshots = teamMembers.map((member: any) => ({
      member_id: member.id,
      academic_year: targetHistoryYearLabel,
      year_of_study: Number(member.year) || 1,
    }));

    const { error: insertError } = await supabase
      .from("club_memberships")
      .insert(historicalSnapshots);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const { error: deleteError } = await supabase
      .from("club_memberships")
      .delete()
      .eq("academic_year", currentActiveAcademicYearStr);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Purge the stale CDN and browser caching segments instantly
    revalidatePath("/admin/dashboard");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}