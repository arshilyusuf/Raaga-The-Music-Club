import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { enforceAdminCheck } from "@/lib/supabase/auth-guard";
import { revalidatePath } from "next/cache";

// ─── 1. ADD NEW PHOTO (PUT) ───────────────────────────────────────────────────
export async function PUT(request: Request) {
  const supabase = await createServerSupabaseClient();

  const guard = await enforceAdminCheck(supabase);
  if (!guard.authorized) return guard.errorResponse;

  try {
    const { photoTargetYear, newPhotoUrl, newPhotoCaption, date } = await request.json();

    if (!newPhotoUrl || !photoTargetYear || !date) {
      return NextResponse.json({ error: "Missing required parameters: url, year, and date are required." }, { status: 400 });
    }

    const { error } = await supabase.from("history_photos").insert([
      {
        academic_year_id: photoTargetYear,
        cloudinary_url: newPhotoUrl,
        caption: newPhotoCaption || null,
        date: date,
      },
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/admin/dashboard");
    revalidatePath("/api/gallery");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── 2. POST HANDLER: ADD YEAR, MEMBER OR UPDATE PHOTO ─────────────────────────
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();

  const guard = await enforceAdminCheck(supabase);
  if (!guard.authorized) return guard.errorResponse;

  try {
    const body = await request.json();
    const { actionType } = body;

    // ─── SUB-CASE A: HANDLE ADD ACADEMIC YEAR ─────────────────────────────────
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

      revalidatePath("/admin/dashboard");
      return NextResponse.json({ success: true });
    }

    // ─── SUB-CASE B: HANDLE ADD HISTORY MEMBER ────────────────────────────────
    if (body.data) {
      const { data, historyMemberTargetYear } = body;
      let finalMemberId = data.member_id;
      const isProfileActive = data.is_active ?? false;
      
      // ─── EXTRACT CLEAN NUMBER FROM SELECT BOX STRING (FIXES THE NULL BUG) ───
      const rawYearValue = data.year_of_study || data.study_year || data.year || "1";
      
      // Strips text characters out and keeps the leading number (e.g., "3rd Year" becomes 3)
      const resolvedStudyYear = typeof rawYearValue === "string" 
        ? (parseInt(rawYearValue.match(/^\d+/)?.[0] || "1", 10)) 
        : Number(rawYearValue || 1);
      // ───────────────────────────────────────────────────────────────────────

      const fallbackTargetYear = data.academic_year || historyMemberTargetYear;
      if (!fallbackTargetYear) {
        return NextResponse.json({ error: "Please select an Academic Year before saving." }, { status: 400 });
      }

      let finalYearLabel = fallbackTargetYear;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(fallbackTargetYear);
      if (isUuid) {
        const { data: yearRecord } = await supabase
          .from("academic_years")
          .select("label")
          .eq("id", fallbackTargetYear)
          .maybeSingle();
        
        if (yearRecord?.label) {
          finalYearLabel = yearRecord.label;
        }
      }

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
                email: data.email || null,
                phone: data.phone || null,
                roll_number: data.roll_number || null,
                branch: data.branch || null,
                instagram: data.instagram || null,
                photo_url: data.photo_url || null,
                domain: data.domain || "musician",
                role: data.role || "Member",
                year: resolvedStudyYear, // Clean integer parsed safely
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
      } else {
        await supabase
          .from("team_members")
          .update({
            name: data.name,
            email: data.email || null,
            phone: data.phone || null,
            branch: data.branch || null,
            domain: data.domain || "musician",
            role: data.role || "Member",
            year: resolvedStudyYear, // Keeps the master table value updated correctly
            instagram: data.instagram || null,
            photo_url: data.photo_url || null,
          })
          .eq("id", finalMemberId);
      }

      const { error: membershipError } = await supabase
        .from("club_memberships")
        .upsert(
          {
            member_id: finalMemberId,
            academic_year: finalYearLabel,
            year_of_study: resolvedStudyYear,
          },
          { onConflict: "member_id,academic_year" }
        );

      if (membershipError) {
        return NextResponse.json({ error: membershipError.message }, { status: 500 });
      }

      revalidatePath("/admin/dashboard");
      return NextResponse.json({ success: true, memberId: finalMemberId });
    }

    // ─── SUB-CASE C: HANDLE UPDATE PHOTO ──────────────────────────────────────
    const { id, photoTargetYear, newPhotoUrl, newPhotoCaption, date } = body;

    if (!id || !newPhotoUrl || !photoTargetYear || !date) {
      return NextResponse.json({ error: "Missing parameters for update operations." }, { status: 400 });
    }

    const { error: photoError } = await supabase
      .from("history_photos")
      .update({
        academic_year_id: photoTargetYear,
        cloudinary_url: newPhotoUrl,
        caption: newPhotoCaption || null,
        date: date,
      })
      .eq("id", id);

    if (photoError) {
      return NextResponse.json({ error: photoError.message }, { status: 500 });
    }

    revalidatePath("/admin/dashboard");
    revalidatePath("/api/gallery");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── 3. DELETE MEMBER FOOTPRINT ENTRY (DELETE) ─────────────────────────────────
export async function DELETE(request: Request) {
  const supabase = await createServerSupabaseClient();

  const guard = await enforceAdminCheck(supabase);
  if (!guard.authorized) return guard.errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");
    const academicYear = searchParams.get("academicYear");

    if (!memberId || !academicYear) {
      return NextResponse.json(
        { error: "Both memberId and academicYear parameters are required." }, 
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("club_memberships")
      .delete()
      .eq("member_id", memberId)
      .eq("academic_year", academicYear)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/admin/dashboard");
    return NextResponse.json({ success: true, deletedData: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── 4. PURGE PHOTO OR TIMELINE ENTRY (PATCH) ──────────────────────────────────
export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient();

  const guard = await enforceAdminCheck(supabase);
  if (!guard.authorized) return guard.errorResponse;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); 
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

    revalidatePath("/admin/dashboard");
    revalidatePath("/api/gallery");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}