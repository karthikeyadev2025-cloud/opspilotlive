import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // ── Authenticate the caller ──────────────────────────────────────
    // This function creates staff accounts and resets passwords, so it
    // must only ever act on behalf of a verified, active admin -- never
    // unauthenticated, and never trusting a client-supplied identity.
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing authorization." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: callerData, error: callerError } = await supabaseAdmin.auth.getUser(token);
    if (callerError || !callerData.user) {
      return new Response(JSON.stringify({ error: "Invalid or expired session." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: callerProfile } = await supabaseAdmin
      .from("app_users")
      .select("role, is_active, tenant_id")
      .eq("id", callerData.user.id)
      .maybeSingle();

    if (!callerProfile || !callerProfile.is_active || callerProfile.role !== "admin") {
      return new Response(JSON.stringify({ error: "Only active admins can perform this action." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerTenantId = callerProfile.tenant_id;

    const body = await req.json();

    // ── Password reset (only for staff in the caller's own tenant) ───
    if (body.action === "reset_password" && body.user_id && body.new_password) {
      if (body.new_password.length < 6) {
        return new Response(JSON.stringify({ error: "Password must be at least 6 characters." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: targetUser } = await supabaseAdmin
        .from("app_users")
        .select("tenant_id")
        .eq("id", body.user_id)
        .maybeSingle();

      if (!targetUser || targetUser.tenant_id !== callerTenantId) {
        return new Response(JSON.stringify({ error: "User not found in your organization." }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(body.user_id, {
        password: body.new_password,
      });
      if (resetError) {
        return new Response(JSON.stringify({ error: resetError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Create a new staff account, scoped to the caller's own tenant ─
    if (body.email && body.password && body.role && body.full_name) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: body.email,
        password: body.password,
        email_confirm: true,
      });

      if (authError) {
        return new Response(JSON.stringify({ error: authError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const userId = authData.user.id;

      const { error: profileError } = await supabaseAdmin.from("app_users").insert({
        id: userId,
        tenant_id: callerTenantId,
        email: body.email,
        full_name: body.full_name,
        role: body.role,
        phone: body.phone || "",
        is_active: true,
      });

      if (profileError) {
        await supabaseAdmin.auth.admin.deleteUser(userId);
        return new Response(JSON.stringify({ error: profileError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({ success: true, user: { id: userId, email: body.email } }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid request." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
