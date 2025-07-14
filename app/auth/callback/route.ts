import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      // 确保会话已创建且有效
      if (error) {
        console.error("Error exchanging code for session:", error);
        return NextResponse.redirect(`${origin}/sign-in?error=auth_exchange_failed`);
      }
      
      // 验证会话是否有效
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        console.error("No valid session after code exchange:", sessionError);
        return NextResponse.redirect(`${origin}/sign-in?error=no_valid_session`);
      }
      
      // 获取用户信息，确保用户数据已加载
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        console.error("Could not retrieve user data:", userError);
        return NextResponse.redirect(`${origin}/sign-in?error=user_fetch_failed`);
      }
      
      // 等待一小段时间，以确保会话状态完全同步
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 成功处理，重定向到指定的页面或dashboard
      if (redirectTo) {
        return NextResponse.redirect(`${origin}${redirectTo}`);
      }
      
      // URL to redirect to after sign up process completes
      return NextResponse.redirect(`${origin}/dashboard`);
    } catch (error) {
      console.error("Callback processing error:", error);
      return NextResponse.redirect(`${origin}/sign-in?error=callback_processing_error`);
    }
  }

  // 没有code参数，这可能是一个错误的请求
  return NextResponse.redirect(`${origin}/sign-in?error=missing_auth_code`);
}
