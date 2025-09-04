import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    // 使用当前请求的 origin，保证与 Google/Supabase 配置一致
    const origin = requestUrl.origin;
    const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

    if (code) {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error("Auth callback error:", error);
        return NextResponse.redirect(`${origin}/sign-in?error=${encodeURIComponent(error.message)}`);
      }
    }

    if (redirectTo) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }

    return NextResponse.redirect(`${origin}/dashboard`);
  } catch (error) {
    try {
      const origin = new URL(request.url).origin;
      return NextResponse.redirect(`${origin}/sign-in?error=Authentication failed`);
    } catch {
      return NextResponse.redirect(`http://localhost:3000/sign-in?error=Authentication failed`);
    }
  }
}
