import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ year: string }> }
) {
  const cookieStore = await cookies();
  const { year: targetYear } = await params; 

  console.log(`[API /api/history/${targetYear}] Request received.`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  try {
    const { data, error } = await supabase
      .from("club_memberships")
      .select(`
        id,
        academic_year,
        year_of_study,
        team_members (*)
      `)
      .eq("academic_year", targetYear);

    if (error) {
      console.error(`[API /api/history/${targetYear}] Supabase Error:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formattedHistory = (data || [])
      .filter((item: any) => item.team_members !== null)
      .map((item: any) => ({
        id: item.team_members?.id,
        membership_id: item.id,
        name: item.team_members?.name,
        email: item.team_members?.email,
        phone: item.team_members?.phone,
        roll_number: item.team_members?.roll_number,
        branch: item.team_members?.branch,
        instagram: item.team_members?.instagram,
        photo_url: item.team_members?.photo_url,
        domain: item.team_members?.domain,
        role: item.team_members?.role,
        is_active: item.team_members?.is_active,
        year_of_study: item.year_of_study, 
        academic_year: item.academic_year,
      }));

    // Sort the history logs alphabetically and case-insensitively by member name
    const sortedHistory = formattedHistory.sort((a: any, b: any) => {
      const nameA = (a.name || "").trim().toLowerCase();
      const nameB = (b.name || "").trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });

    return NextResponse.json({ members: sortedHistory });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}