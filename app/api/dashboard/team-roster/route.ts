import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { enforceAdminCheck } from "@/lib/supabase/auth-guard";

export async function GET() {
  const supabase = await createServerSupabaseClient();

  // Enforce global admin check using your centralized guard file
  const guard = await enforceAdminCheck(supabase);
  if (!guard.authorized) return guard.errorResponse;

  try {
    const currentCalendarYear = new Date().getFullYear();
    const shortNextYear = String(currentCalendarYear + 1).slice(-2);
    const currentActiveAcademicYearStr = `${currentCalendarYear}-${shortNextYear}`;

    const { data, error } = await supabase
      .from("club_memberships")
      .select(`
        id,
        academic_year,
        year_of_study,
        team_members!inner (*)
      `)
      .eq("academic_year", currentActiveAcademicYearStr)
      .eq("team_members.is_active", true)
      .order("year_of_study", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Database query failure", details: error }, { status: 500 });
    }

    const formattedActive = (data || [])
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

    // Sort the array case-insensitively and alphabetically by the member's name
    const sortedActive = formattedActive.sort((a: any, b: any) => {
      const nameA = (a.name || "").trim().toLowerCase();
      const nameB = (b.name || "").trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });

    // ─── ADD CACHE HEADERS TO RESPONSE ──────────────────────────────────────
    return NextResponse.json(sortedActive, {
      headers: {
        // public: Allows caching on intermediate servers/CDNs
        // s-maxage=60: Cache at the CDN layer for 60 seconds
        // stale-while-revalidate=30: Serve the cached data instantly while refreshing it in the background
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });

  } catch (err: any) {
    return NextResponse.json({ error: "Internal Server Error", message: err.message }, { status: 500 });
  }
}