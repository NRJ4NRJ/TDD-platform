import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const ALLOWED_NEXT_PATHS = /^\/[a-zA-Z0-9\-_/]*$/;

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/projects";
  // Only allow relative paths — block open redirects to external domains
  const next = ALLOWED_NEXT_PATHS.test(rawNext) ? rawNext : "/projects";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
