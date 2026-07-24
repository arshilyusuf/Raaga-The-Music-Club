import { NextResponse } from "next/server";

export async function isAdminUser(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  return !error && !!data;
}

function hasAdminMetadata(user: any) {
  return user?.app_metadata?.is_admin === true || user?.user_metadata?.is_admin === true;
}

export async function enforceAdminCheck(supabase: any) {
  // 1. Get the current authenticated user securely via JWT validation
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { error: "Unauthorized access mapping denied." },
        { status: 401 },
      ),
    };
  }

  // 2. Validate against the trusted admin allowlist table or explicit auth metadata
  const isAdmin = hasAdminMetadata(user) || (await isAdminUser(supabase, user.id));
  if (!isAdmin) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { error: "Forbidden: Administrative configurations required." },
        { status: 403 },
      ),
    };
  }

  // Return authorized access state along with user context profiles
  return { authorized: true, user };
}
