import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { enforceAdminCheck } from "@/lib/supabase/auth-guard";

export async function GET() {
  const supabase = await createServerSupabaseClient();

  // Enforce global admin check using your centralized guard file
  const guard = await enforceAdminCheck(supabase);
  if (!guard.authorized) return guard.errorResponse;

  // Calculate target active academic year string server-side (e.g., "2026-27")
  const currentCalendarYear = new Date().getFullYear();
  const shortNextYear = String(currentCalendarYear + 1).slice(-2);
  const currentActiveAcademicYearStr = `${currentCalendarYear}-${shortNextYear}`;

  try {
    const [activeMembersQuery, ay, hp, ae, regs, countsQuery] =
      await Promise.all([
        supabase
          .from("club_memberships")
          .select(`
            id,
            academic_year,
            year_of_study,
            team_members!inner (*)
          `)
          .eq("academic_year", currentActiveAcademicYearStr)
          .eq("team_members.is_active", true)
          .order("year_of_study", { ascending: true }),

        supabase
          .from("academic_years")
          .select("*")
          .order("start_year", { ascending: false }),

        supabase.from("history_photos").select("*").order("created_at"),
        supabase.from("audition_archive").select("*").order("archived_at", { ascending: false }),
        supabase.from("audition_registrations").select("*").order("submitted_at", { ascending: false }),

        supabase
          .from("club_memberships")
          .select("academic_year")
      ]);

    const errors = [
      activeMembersQuery.error, 
      ay.error, 
      hp.error, 
      ae.error, 
      regs.error,
      countsQuery.error
    ].filter(Boolean);

    if (errors.length > 0) {
      return NextResponse.json({ error: "Database query failure", details: errors }, { status: 500 });
    }

    let formattedActive: any[] = [];
    if (activeMembersQuery.data) {
      formattedActive = activeMembersQuery.data
        .filter((item: any) => item.team_members !== null)
        .map((item: any) => ({
          id: item.team_members?.id,
          membership_id: item.id,
          name: item.team_members?.name,
          branch: item.team_members?.branch,
          email: item.team_members?.email,
          phone: item.team_members?.phone,
          roll_number: item.team_members?.roll_number,
          instagram: item.team_members?.instagram,
          photo_url: item.team_members?.photo_url,
          year: item.team_members?.year, 
          domain: item.team_members?.domain,
          role: item.team_members?.role,
          is_active: item.team_members?.is_active, 
          academic_year: item.academic_year,
        }));
    }

    const memberCountsPerYear: Record<string, number> = {};
    if (countsQuery.data) {
      countsQuery.data.forEach((row: any) => {
        const yearKey = row.academic_year;
        if (yearKey) {
          memberCountsPerYear[yearKey] = (memberCountsPerYear[yearKey] || 0) + 1;
        }
      });
    }

    // ─── ADD CACHE HEADERS TO RESPONSE ──────────────────────────────────────
    return NextResponse.json(
      {
        teamMembers: formattedActive,
        academicYears: ay.data || [],
        historyPhotos: hp.data || [],
        archiveEntries: ae.data || [],
        registrations: regs.data || [],
        memberCounts: memberCountsPerYear, 
      },
      {
        headers: {
          // s-maxage=60: Cache on the server/Vercel CDN edge for 60 seconds
          // stale-while-revalidate: Serve stale data while fetching the new version in the background
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      }
    );

  } catch (err: any) {
    return NextResponse.json({ error: "Internal Server Error", message: err.message }, { status: 500 });
  }
}