import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { enforceAdminCheck } from "@/lib/supabase/auth-guard";

export async function GET() {
  const supabase = await createServerSupabaseClient();

  // Enforce global admin check using your centralized guard file
  const guard = await enforceAdminCheck(supabase);
  if (!guard.authorized) return guard.errorResponse;

  try {
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

    // ─── ADD CACHE HEADERS TO RESPONSE ──────────────────────────────────────
    return NextResponse.json(
      {
        totalMembers: profilesQuery.count || 0,
        memberCounts: memberCountsPerYear
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