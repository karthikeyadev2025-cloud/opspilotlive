import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/razorpay/, "");

    const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID") || "";
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET") || "";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // POST /razorpay/create-order
    if (path === "/create-order" && req.method === "POST") {
      const { tenant_id, plan_id, months = 1 } = await req.json();

      const { data: plan } = await supabase.from("saas_plans").select("*").eq("id", plan_id).single();
      if (!plan) return json({ error: "Plan not found" }, 404);

      const amount = Math.round(plan.price_monthly * months * 100); // paise
      const receipt = `fp_${tenant_id.slice(0, 8)}_${Date.now()}`;

      const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`,
        },
        body: JSON.stringify({ amount, currency: "INR", receipt, notes: { tenant_id, plan_id, months: String(months) } }),
      });

      if (!rzpRes.ok) {
        const err = await rzpRes.text();
        return json({ error: "Razorpay error: " + err }, 502);
      }

      const order = await rzpRes.json();

      await supabase.from("razorpay_orders").insert({
        tenant_id,
        razorpay_order_id: order.id,
        plan_id,
        amount,
        currency: "INR",
        months,
        receipt,
        status: "created",
      });

      return json({ order_id: order.id, amount, currency: "INR", key_id: RAZORPAY_KEY_ID });
    }

    // POST /razorpay/verify-payment
    if (path === "/verify-payment" && req.method === "POST") {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tenant_id, plan_id, months = 1 } = await req.json();

      // Verify HMAC signature
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSig = createHmac("sha256", RAZORPAY_KEY_SECRET).update(body).digest("hex");

      if (expectedSig !== razorpay_signature) {
        return json({ error: "Invalid payment signature" }, 400);
      }

      const { data: order } = await supabase.from("razorpay_orders").select("*").eq("razorpay_order_id", razorpay_order_id).maybeSingle();
      if (!order) return json({ error: "Order not found" }, 404);

      const { data: plan } = await supabase.from("saas_plans").select("*").eq("id", plan_id).single();
      if (!plan) return json({ error: "Plan not found" }, 404);

      // Record payment
      await supabase.from("razorpay_payments").insert({
        tenant_id,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        plan_id,
        amount: order.amount,
        currency: "INR",
        months,
        status: "captured",
      });

      // Update order status
      await supabase.from("razorpay_orders").update({ status: "paid", updated_at: new Date().toISOString() }).eq("razorpay_order_id", razorpay_order_id);

      // Activate tenant subscription
      const now = new Date();
      const subEnd = new Date(now);
      subEnd.setMonth(subEnd.getMonth() + months);

      await supabase.from("tenants").update({
        status: "active",
        plan_id,
        subscription_starts_at: now.toISOString(),
        subscription_ends_at: subEnd.toISOString(),
        updated_at: now.toISOString(),
      }).eq("id", tenant_id);

      // Log to tenant_subscriptions
      await supabase.from("tenant_subscriptions").insert({
        tenant_id,
        plan_id,
        event: "payment_captured",
        amount: order.amount / 100,
        razorpay_order_id,
        razorpay_payment_id,
        valid_from: now.toISOString(),
        valid_until: subEnd.toISOString(),
      });

      return json({ success: true, subscription_ends_at: subEnd.toISOString() });
    }

    // POST /razorpay/webhook (Razorpay webhook endpoint)
    if (path === "/webhook" && req.method === "POST") {
      const WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") || "";
      const signature = req.headers.get("x-razorpay-signature") || "";
      const rawBody = await req.text();

      const expectedSig = createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");
      if (WEBHOOK_SECRET && expectedSig !== signature) {
        return json({ error: "Invalid webhook signature" }, 400);
      }

      const event = JSON.parse(rawBody);
      if (event.event === "payment.captured") {
        const payment = event.payload.payment.entity;
        await supabase.from("razorpay_orders").update({ status: "paid", updated_at: new Date().toISOString() }).eq("razorpay_order_id", payment.order_id);
      }
      if (event.event === "payment.failed") {
        await supabase.from("razorpay_orders").update({ status: "failed", updated_at: new Date().toISOString() }).eq("razorpay_order_id", event.payload.payment.entity.order_id);
      }

      return json({ received: true });
    }

    return json({ error: "Not found" }, 404);
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});
