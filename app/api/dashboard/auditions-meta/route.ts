import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    const [ae, regs] = await Promise.all([
      supabase.from("audition_archive").select("*").order("archived_at", { ascending: false }),
      supabase.from("audition_registrations").select("*").order("submitted_at", { ascending: false })
    ]);

    if (ae.error || regs.error) {
      return NextResponse.json({ error: "Database query failure" }, { status: 500 });
    }

    return NextResponse.json({
      archiveEntries: ae.data || [],
      registrations: regs.data || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal Server Error", message: err.message }, { status: 500 });
  }
}