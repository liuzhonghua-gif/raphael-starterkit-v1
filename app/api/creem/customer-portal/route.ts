import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    // Get the user from the session
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Use service role client for database operations
    const serviceClient = createServiceRoleClient();

    // Get the customer record for this user - don't use .single()
    const { data: customers, error: customerError } = await serviceClient
      .from("customers")
      .select("creem_customer_id")
      .eq("user_id", user.id);

    if (customerError) {
      return new NextResponse("Error fetching customer data", { status: 500 });
    }

    // Check if any customer records exist
    const customer = customers && customers.length > 0 ? customers[0] : null;
    
    if (!customer || !customer.creem_customer_id) {
      return new NextResponse("No subscription found", { status: 404 });
    }

    // Call Creem API to get the customer portal link
    const response = await fetch(
      `${process.env.CREEM_API_URL}/customers/billing`,
      {
        method: "POST",
        headers: {
          "x-api-key": process.env.CREEM_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: customer.creem_customer_id,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get customer portal link");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error getting customer portal link:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
