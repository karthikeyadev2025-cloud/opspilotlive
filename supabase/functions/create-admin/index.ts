import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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

    const body = await req.json();

    // Password reset action
    if (body.action === 'reset_password' && body.user_id && body.new_password) {
      if (body.new_password.length < 6) {
        return new Response(JSON.stringify({ error: 'Password must be at least 6 characters.' }), {
          status: 400,
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
        email: body.email,
        full_name: body.full_name,
        role: body.role,
        phone: body.phone || "",
        is_active: true,
        created_by: body.created_by || null,
      });

      if (profileError) {
        await supabaseAdmin.auth.admin.deleteUser(userId);
        return new Response(JSON.stringify({ error: profileError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({ success: true, user_id: userId, email: body.email }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminEmail = "admin@aadyaenterprises.com";
    const adminPassword = "AadyaAdmin@2026";
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUsers?.users.find((u: any) => u.email === adminEmail);

    if (userExists) {
      await supabaseAdmin.auth.admin.updateUserById(userExists.id, { password: adminPassword });
      return new Response(
        JSON.stringify({ success: true, message: "Admin password updated", email: adminEmail }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (error) throw error;

    await supabaseAdmin.from("app_users").upsert({
      id: data.user.id,
      email: adminEmail,
      full_name: "Admin",
      role: "admin",
      phone: "",
      is_active: true,
    });

    return new Response(
      JSON.stringify({ success: true, message: "Admin user created", email: adminEmail }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
