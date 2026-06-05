import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { enforceAdminCheck } from "@/lib/supabase/auth-guard";
import { revalidatePath } from "next/cache";

// GET: Fetch paginated, search-filtered master history membership logs
export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient();

  // Enforce global admin check
  const guard = await enforceAdminCheck(supabase);
  if (!guard.authorized) return guard.errorResponse;

  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";

    const fromRange = page * limit;
    const toRange = fromRange + limit - 1;

    let query = supabase
      .from("team_members")
      .select(`
        id,
        name,
        email,
        phone,
        roll_number,
        branch,
        photo_url,
        instagram,
        year,
        domain,
        role,
        is_active,
        club_memberships (
          id,
          academic_year,
          year_of_study
        )
      `)
      .order("id", { ascending: true }) // Enforce order stability across pages
      .range(fromRange, toRange);

    if (search.trim()) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ─── ADD CACHE HEADERS TO RESPONSE ──────────────────────────────────────
    return NextResponse.json(data || [], {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal Server Error", message: err.message }, { status: 500 });
  }
}

// PUT: Modify core profile metadata registry properties
export async function PUT(request: Request) {
  const supabase = await createServerSupabaseClient();

  // Enforce global admin check
  const guard = await enforceAdminCheck(supabase);
  if (!guard.authorized) return guard.errorResponse;

  try {
    const { profileId, formData } = await request.json();

    if (!profileId) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("team_members")
      .update({
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        roll_number: formData.roll_number || null,
        branch: formData.branch || null,
        instagram: formData.instagram || null,
        photo_url: formData.photo_url || null,
        year: formData.year || 1,
        domain: formData.domain || "musician",
        role: formData.role || "Member",
        is_active: formData.is_active !== false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Purge cached values across dashboard components
    revalidatePath("/admin/dashboard");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal Server Error", message: err.message }, { status: 500 });
  }
}

// DELETE: Completely wipe profile entry and memberships cascade
export async function DELETE(request: Request) {
  const supabase = await createServerSupabaseClient();

  // Enforce global admin check
  const guard = await enforceAdminCheck(supabase);
  if (!guard.authorized) return guard.errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", profileId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Purge cached values across dashboard components
    revalidatePath("/admin/dashboard");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal Server Error", message: err.message }, { status: 500 });
  }
}