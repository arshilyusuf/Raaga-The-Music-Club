import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    // Query team_members directly as the single source of truth
    const { data, error } = await supabase
      .from("team_members")
      .select("name, photo_url, instagram, domain, role, year, is_active")
      .eq("is_active", true); // Only select active members

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format payload data while safe-checking strings
    const activeMembers = (data || []).map((m: any) => ({
      name: m.name,
      photo_url: m.photo_url,
      instagram: m.instagram,
      domain: m.domain ? m.domain.toLowerCase().trim() : "",
      role: m.role,
      year: Number(m.year),
    }));

    // Helper to alphabetically sort any dataset slice by member name
    const sortAlphabetically = (arr: any[]) =>
      arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    // Distribute into target roster structural lists based on team_members fields
    const heads = activeMembers.filter((m) => m.year === 4).map((m) => ({
      name: m.name,
      title: m.role || "Head Coordinator",
      avatar: m.photo_url || "",
      instagramURL: m.instagram || "",
    }));

    const core = activeMembers.filter((m) => m.year === 3).map((m) => ({
      name: m.name,
      title: m.role || "Vocalist",
      image: m.photo_url || "https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58",
      instagramURL: m.instagram || "",
    }));

    const exes = activeMembers
      .filter((m) => m.year === 2 && ["musician", "instrumentals", "vocals"].includes(m.domain))
      .map((m) => ({
        name: m.name,
        title: m.role || "Vocalist",
      }));

    const management = activeMembers.filter((m) => m.domain === "management").map((m) => ({ name: m.name }));
    const anchoring = activeMembers.filter((m) => m.domain === "anchoring").map((m) => ({ name: m.name }));

    return NextResponse.json({
      heads: sortAlphabetically(heads),
      core: sortAlphabetically(core),
      exes: sortAlphabetically(exes),
      management: sortAlphabetically(management),
      anchoring: sortAlphabetically(anchoring),
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal Server Error", message: err.message }, { status: 500 });
  }
}