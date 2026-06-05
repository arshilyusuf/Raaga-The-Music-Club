import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { enforceAdminCheck } from "@/lib/supabase/auth-guard";

export async function GET() {
  const supabase = await createServerSupabaseClient();

  // Enforce global admin check using your centralized guard file
  const guard = await enforceAdminCheck(supabase);
  if (!guard.authorized) return guard.errorResponse;

  try {
    const [ae, regs] = await Promise.all([
      supabase.from("audition_archive").select("*").order("archived_at", { ascending: false }),
      supabase.from("audition_registrations").select("*").order("submitted_at", { ascending: false })
    ]);

    if (ae.error || regs.error) {
      return NextResponse.json({ error: "Database query failure" }, { status: 500 });
    }

    // ─── ADD CACHE HEADERS TO RESPONSE ──────────────────────────────────────
    return NextResponse.json(
      {
        archiveEntries: ae.data || [],
        registrations: regs.data || [],
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