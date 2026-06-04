import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Safe to ignore if executing inside a Server Component context
          }
        },
      },
    }
  );

  // Calculate target active academic year string server-side (e.g., "2026-27")
  const currentCalendarYear = new Date().getFullYear();
  const shortNextYear = String(currentCalendarYear + 1).slice(-2);
  const currentActiveAcademicYearStr = `${currentCalendarYear}-${shortNextYear}`;

  try {
    const [activeMembersQuery, ay, hp, ae, regs, countsQuery] =
      await Promise.all([
        // 1. Active team memberships for current operational cycle filtered by team_members.is_active = true
        supabase
          .from("club_memberships")
          .select(`
            id,
            academic_year,
            year_of_study,
            team_members!inner (*)
          `)
          .eq("academic_year", currentActiveAcademicYearStr)
          .eq("team_members.is_active", true) // <-- Added filter to enforce active status on team_members profile
          .order("year_of_study", { ascending: true }),

        // 2. Metadata index list of all recorded academic years
        supabase
          .from("academic_years")
          .select("*")
          .order("start_year", { ascending: false }),

        // 3. Media, archives, and system registrations
        supabase.from("history_photos").select("*").order("created_at"),
        supabase.from("audition_archive").select("*").order("archived_at", { ascending: false }),
        supabase.from("audition_registrations").select("*").order("submitted_at", { ascending: false }),

        // 4. OPTIMIZED COUNTS: Lightweight lookup to pre-calculate team sizing per year
        supabase
          .from("club_memberships")
          .select("academic_year")
      ]);

    // Check for critical database connectivity errors across concurrent provisions
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

    // Format active roster records for current layout presentation layers
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

    // Reduce membership lines down to a flat hash mapping dictionary table: { "2025-26": 12, "2026-27": 15 }
    const memberCountsPerYear: Record<string, number> = {};
    if (countsQuery.data) {
      countsQuery.data.forEach((row: any) => {
        const yearKey = row.academic_year;
        if (yearKey) {
          memberCountsPerYear[yearKey] = (memberCountsPerYear[yearKey] || 0) + 1;
        }
      });
    }

    return NextResponse.json({
      teamMembers: formattedActive,
      academicYears: ay.data || [],
      historyPhotos: hp.data || [],
      archiveEntries: ae.data || [],
      registrations: regs.data || [],
      memberCounts: memberCountsPerYear, 
    });

  } catch (err: any) {
    return NextResponse.json({ error: "Internal Server Error", message: err.message }, { status: 500 });
  }
}