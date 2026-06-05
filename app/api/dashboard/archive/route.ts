import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { enforceAdminCheck } from "@/lib/supabase/auth-guard";
import { revalidatePath } from "next/cache";

export async function DELETE(request: Request) {
  const supabase = await createServerSupabaseClient();

  // Enforce global admin check using your centralized guard file
  const guard = await enforceAdminCheck(supabase);
  if (!guard.authorized) return guard.errorResponse;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Archive entry ID is required" }, { status: 400 });
  }

  try {
    const { error } = await supabase.from("audition_archive").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Purge the stale CDN and browser caching segments instantly
    revalidatePath("/admin/dashboard");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}