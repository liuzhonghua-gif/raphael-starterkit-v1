import { NextResponse } from "next/server";

export async function GET() {
  // 只在开发环境中显示环境变量信息
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ 
      message: "Environment variables are not displayed in production" 
    });
  }

  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "已设置" : "未设置",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "已设置" : "未设置",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "未设置",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "已设置" : "未设置",
  };

  return NextResponse.json(envVars);
}
