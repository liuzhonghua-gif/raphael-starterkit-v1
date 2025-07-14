import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { SubscriptionStatusCard } from "@/components/dashboard/subscription-status-card";
import { CreditsBalanceCard } from "@/components/dashboard/credits-balance-card";
import { QuickActionsCard } from "@/components/dashboard/quick-actions-card";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error or no user:", userError);
    return redirect("/sign-in");
  }

  try {
    // 检查用户是否有customer记录
    const { data: customers, error: customerError } = await supabase
      .from("customers")
      .select(
        `
        *,
        subscriptions (
          status,
          current_period_end,
          creem_product_id
        ),
        credits_history (
          amount,
          type,
          created_at
        )
      `
      )
      .eq("user_id", user.id);

    // 记录详细的错误信息以便调试
    if (customerError) {
      console.error("Error fetching customer data:", JSON.stringify(customerError));
    }

    // 检查是否有顾客记录，如果没有，显示一个基本的仪表板而不是报错
    const customerData = customers && customers.length > 0 ? customers[0] : null;
    const hasCustomerData = !!customerData;
    const subscription = hasCustomerData ? customerData.subscriptions?.[0] || null : null;
    const credits = hasCustomerData ? customerData.credits || 0 : 0;
    const recentCreditsHistory = hasCustomerData ? customerData.credits_history?.slice(0, 2) || [] : [];

    return renderDashboard(user, { 
      subscription, 
      credits, 
      credits_history: recentCreditsHistory 
    }, customerError);
  } catch (error) {
    console.error("Error in dashboard page:", error);
    return (
      <div className="flex-1 w-full flex flex-col gap-6 sm:gap-8 px-4 sm:px-8 container">
        <div className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 border rounded-lg p-6 sm:p-8 mt-6 sm:mt-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Error loading dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            There was a problem loading your dashboard data. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }
}

// 提取出渲染逻辑，使代码更清晰
function renderDashboard(user: any, customerData: any, customerError: any = null) {
  const { 
    subscription = null, 
    credits = 0, 
    credits_history: recentCreditsHistory = [] 
  } = customerData || {};
  
  return (
    <div className="flex-1 w-full flex flex-col gap-6 sm:gap-8 px-4 sm:px-8 container">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border rounded-lg p-6 sm:p-8 mt-6 sm:mt-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">
          Welcome back,{" "}
          <span className="block sm:inline mt-1 sm:mt-0">{user.email}</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your subscription and credits from your personal dashboard.
        </p>
      </div>

      {/* 如果没有顾客数据，显示一个更明确的提示信息 */}
      {customerError && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 p-4 sm:p-6">
          <h3 className="font-medium text-lg mb-2">Account Setup In Progress</h3>
          <p className="text-sm mb-2">
            Your account is being set up. To complete the process, please refresh this page or sign out and sign in again.
          </p>
          <p className="text-sm text-muted-foreground">
            If this message persists after several attempts, please contact support.
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SubscriptionStatusCard subscription={subscription} />
        <CreditsBalanceCard
          credits={credits}
          recentHistory={Array.isArray(recentCreditsHistory) ? recentCreditsHistory : []}
        />
        <QuickActionsCard />
      </div>

      {/* User Details Section */}
      <div className="rounded-xl border bg-card p-4 sm:p-6 mb-6">
        <h2 className="font-bold text-lg sm:text-xl mb-4">Account Details</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium break-all">{user.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">User ID</p>
              <p className="font-medium break-all">{user.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
