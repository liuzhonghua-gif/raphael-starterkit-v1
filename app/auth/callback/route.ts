import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // The `/auth/callback` route is required for the server-side auth flow implemented
    // by the SSR package. It exchanges an auth code for the user's session.
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    
    // 使用环境变量中的站点URL，如果没有则使用请求的origin
    const origin = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin;
    const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

    if (code) {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error("Auth callback error:", error);
        // 如果认证失败，重定向到登录页面并显示错误
        return NextResponse.redirect(`${origin}/sign-in?error=${encodeURIComponent(error.message)}`);
      }
    }

    if (redirectTo) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }

    // URL to redirect to after sign up process completes
    return NextResponse.redirect(`${origin}/dashboard`);
  } catch (error) {
    console.error("Callback route error:", error);
    // 如果发生错误，重定向到登录页面
    const fallbackOrigin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    return NextResponse.redirect(`${fallbackOrigin}/sign-in?error=Authentication failed`);
  }
}
