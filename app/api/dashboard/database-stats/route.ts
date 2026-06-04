import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    // Fetch total profiles count and raw academic years parallelly
    const [profilesQuery, membershipsQuery] = await Promise.all([
      supabase.from("team_members").select("*", { count: "exact", head: true }),
      supabase.from("club_memberships").select("academic_year")
    ]);

    if (profilesQuery.error) {
      return NextResponse.json({ error: profilesQuery.error.message }, { status: 500 });
    }
    if (membershipsQuery.error) {
      return NextResponse.json({ error: membershipsQuery.error.message }, { status: 500 });
    }

    // Process membership rows down into an annual count mapping dictionary
    const memberCountsPerYear: Record<string, number> = {};
    if (membershipsQuery.data) {
      membershipsQuery.data.forEach((row: any) => {
        const yearKey = row.academic_year;
        if (yearKey) {
          memberCountsPerYear[yearKey] = (memberCountsPerYear[yearKey] || 0) + 1;
        }
      });
    }

    return NextResponse.json({
      totalMembers: profilesQuery.count || 0,
      memberCounts: memberCountsPerYear
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal Server Error", message: err.message }, { status: 500 });
  }
}