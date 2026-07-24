import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { enforceAdminCheck } from "@/lib/supabase/auth-guard";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  const supabase = authHeader?.startsWith("Bearer ")
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: authHeader,
            },
          },
        },
      )
    : await createServerSupabaseClient();

  // Run your centralized security guard
  const guard = await enforceAdminCheck(supabase);
  
  if (!guard.authorized) {
    return NextResponse.json({ isAdmin: false }, { status: 200 });
  }

  return NextResponse.json({ isAdmin: true }, { status: 200 });
}