import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// POST: Add a History Member
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();

  try {
    const body = await request.json();
    const { actionType } = body;

    // Handle Add Academic Year
    if (actionType === "addYear") {
      const { newYearLabel, newYearStart } = body;

      if (!newYearLabel) {
        return NextResponse.json({ error: "Year label is required" }, { status: 400 });
      }

      const { error } = await supabase
        .from("academic_years")
        .insert([{ label: newYearLabel, start_year: newYearStart }]);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    // Handle Add History Member (Your Existing Code)
    const { data, historyMemberTargetYear } = body;
    let finalMemberId = data.member_id;
    const isProfileActive = data.is_active ?? false;
    const resolvedStudyYear = data.study_year || data.year || 1;

    if (!data.is_existing_member) {
      const { data: existingProfile } = await supabase
        .from("team_members")
        .select("id")
        .eq("roll_number", data.roll_number || "")
        .maybeSingle();

      if (existingProfile) {
        finalMemberId = existingProfile.id;
      } else {
        const { data: profileRow, error: profileError } = await supabase
          .from("team_members")
          .insert([
            {
              name: data.name,
              email: data.email,
              phone: data.phone,
              roll_number: data.roll_number || null,
              branch: data.branch,
              instagram: data.instagram,
              photo_url: data.photo_url,
              year: resolvedStudyYear,
              domain: data.domain || "musician",
              role: data.role || "Member",
              is_active: isProfileActive,
            },
          ])
          .select("id")
          .single();

        if (profileError || !profileRow) {
          return NextResponse.json(
            { error: profileError?.message || "Could not generate profile index." },
            { status: 500 }
          );
        }
        finalMemberId = profileRow.id;
      }
    }

    const targetedYear = data.academic_year || historyMemberTargetYear;
    if (!targetedYear) {
      return NextResponse.json({ error: "Please select an Academic Year before saving." }, { status: 400 });
    }

    const { error: membershipError } = await supabase
      .from("club_memberships")
      .upsert(
        {
          member_id: finalMemberId,
          academic_year: targetedYear,
          year_of_study: resolvedStudyYear,
        },
        { onConflict: "member_id,academic_year" }
      );

    if (membershipError) {
      return NextResponse.json({ error: membershipError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Remove a Member from History
export async function DELETE(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const memberId = searchParams.get("memberId");
    const academicYear = searchParams.get("academicYear");

    if (!memberId || !academicYear) {
      return NextResponse.json(
        { error: "Both memberId and academicYear parameters are required." }, 
        { status: 400 }
      );
    }

    // Deletes the unique row linking this person to this specific academic year
    const { data, error } = await supabase
      .from("club_memberships")
      .delete()
      .eq("member_id", memberId)
      .eq("academic_year", academicYear)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedData: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const supabase = await createServerSupabaseClient();

  try {
    const { photoTargetYear, newPhotoUrl, newPhotoCaption } = await request.json();

    if (!newPhotoUrl || !photoTargetYear) {
      return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
    }

    const { error } = await supabase.from("history_photos").insert([
      {
        academic_year_id: photoTargetYear,
        cloudinary_url: newPhotoUrl,
        caption: newPhotoCaption || null,
      },
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Delete alternative entities (Academic Year or Photo) based on type
export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // "year" or "photo"
  const id = searchParams.get("id");

  if (!id || !type) {
    return NextResponse.json({ error: "Missing identity parameters" }, { status: 400 });
  }

  try {
    let error;
    if (type === "year") {
      const res = await supabase.from("academic_years").delete().eq("id", id);
      error = res.error;
    } else if (type === "photo") {
      const res = await supabase.from("history_photos").delete().eq("id", id);
      error = res.error;
    } else {
      return NextResponse.json({ error: "Invalid target type value" }, { status: 400 });
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}