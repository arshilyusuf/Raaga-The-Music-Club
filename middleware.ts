import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminUser } from "@/lib/supabase/auth-guard";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Fix for request.cookies.set inside Next.js 15 Middleware
            request.cookies.set({
              name,
              value,
              ...options,
            });
          });

          response = NextResponse.next({
            request: { headers: request.headers },
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Validate the user token securely on the server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If the user tries to hit any URL starting with /admin...
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // 1. Allow unauthenticated visitors through to access the inline login panel
    if (!user) {
      return response;
    }

    // 2. Kick out authenticated users who are NOT in the admin allowlist
    const isAdmin = await isAdminUser(supabase, user.id);
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", request.url)); // Send to public home page
    }
  }

  return response;
}

// Optimization: Only execute this file on routes inside your admin subfolders
export const config = {
  matcher: ["/admin/:path*"],
};
