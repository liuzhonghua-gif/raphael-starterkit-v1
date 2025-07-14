"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ArrowRight, CreditCard, Receipt, Settings, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function SubscriptionPortalDialog() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCustomer, setHasCustomer] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    const checkCustomer = async () => {
      try {
        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setHasCustomer(false);
          return;
        }

        // Don't use .single() to avoid PGRST116 error
        const { data: customers, error: customerError } = await supabase
          .from("customers")
          .select("creem_customer_id")
          .eq("user_id", user.id);

        if (customerError) {
          console.error("Error fetching customer:", customerError);
          setHasCustomer(false);
          return;
        }

        // Check if any customer records exist and have a creem_customer_id
        const customer = customers && customers.length > 0 ? customers[0] : null;
        setHasCustomer(!!customer?.creem_customer_id);
      } catch (err) {
        console.error("Error checking customer:", err);
        setHasCustomer(false);
      }
    };

    checkCustomer();
  }, []);

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/creem/customer-portal");
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to get portal link");
      }

      const { customer_portal_link } = await response.json();
      
      if (!customer_portal_link) {
        throw new Error("No portal link received");
      }
      
      window.open(customer_portal_link, "_blank");
      setOpen(false);
    } catch (err) {
      console.error("Error getting portal link:", err);
      setError("Failed to access subscription portal. Please try again later.");
      toast({
        title: "Error",
        description: "Could not open subscription portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 显示按钮，但在点击时提示创建订阅
  const handleNoSubscription = () => {
    toast({
      title: "No subscription found",
      description: "You need to subscribe to a plan first.",
      variant: "default",
    });
  };

  // 如果状态仍在加载中，显示基本按钮
  if (hasCustomer === null) {
    return (
      <Button variant="outline" className="w-full" disabled>
        Manage Plan
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={hasCustomer ? undefined : handleNoSubscription}
        >
          Manage Plan
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      {hasCustomer && (
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Subscription Management</DialogTitle>
            <DialogDescription>
              Access your subscription settings in our secure customer portal.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-6">
              {/* Portal Features */}
              <div className="grid gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Payment Methods</p>
                    <p className="text-sm text-muted-foreground">
                      Update your billing information
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Receipt className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Billing History</p>
                    <p className="text-sm text-muted-foreground">
                      View past invoices and payments
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Settings className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Plan Settings</p>
                    <p className="text-sm text-muted-foreground">
                      Change or cancel your subscription
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button onClick={handleManageSubscription} disabled={isLoading}>
              {isLoading ? "Redirecting..." : "Continue to Portal"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
