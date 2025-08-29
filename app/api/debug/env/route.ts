import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 检查关键环境变量是否设置（不显示具体值）
    const envStatus = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ 已设置" : "❌ 未设置",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ 已设置" : "❌ 未设置",
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ? `✅ 已设置: ${process.env.NEXT_PUBLIC_SITE_URL}` : "❌ 未设置",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ 已设置" : "❌ 未设置",
      // 显示当前请求的域名信息
      currentRequestOrigin: "当前请求来源",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      message: "环境变量状态检查",
      status: envStatus,
      note: "请确保所有必需的环境变量都已正确设置"
    });
  } catch (error) {
    return NextResponse.json({
      error: "检查环境变量时发生错误",
      message: error instanceof Error ? error.message : "未知错误"
    }, { status: 500 });
  }
}
