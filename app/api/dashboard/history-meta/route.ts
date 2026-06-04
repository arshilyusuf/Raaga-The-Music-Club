import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    const [ay, hp, countsQuery] = await Promise.all([
      supabase.from("academic_years").select("*").order("start_year", { ascending: false }),
      supabase.from("history_photos").select("*").order("created_at"),
      supabase.from("club_memberships").select("academic_year")
    ]);

    if (ay.error || hp.error || countsQuery.error) {
      return NextResponse.json({ error: "Database lookup failed" }, { status: 500 });
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

    return NextResponse.json({
      academicYears: ay.data || [],
      historyPhotos: hp.data || [],
      memberCounts: memberCountsPerYear,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal Server Error", message: err.message }, { status: 500 });
  }
}