import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
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

    return NextResponse.json(sortedActive);
  } catch (err: any) {
    return NextResponse.json({ error: "Internal Server Error", message: err.message }, { status: 500 });
  }
}