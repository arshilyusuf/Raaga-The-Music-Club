import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { enforceAdminCheck } from "@/lib/supabase/auth-guard";

export async function GET() {
  const supabase = await createServerSupabaseClient();

  // Enforce global admin check using your centralized guard file
  const guard = await enforceAdminCheck(supabase);
  if (!guard.authorized) return guard.errorResponse;

  try {
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

    // ─── ADD CACHE HEADERS TO RESPONSE ──────────────────────────────────────
    return NextResponse.json(
      {
        academicYears: ay.data || [],
        historyPhotos: hp.data || [],
        memberCounts: memberCountsPerYear,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: "Internal Server Error", message: err.message }, { status: 500 });
  }
}