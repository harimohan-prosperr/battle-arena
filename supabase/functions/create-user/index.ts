import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  // CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  try {
    // Handle OPTIONS
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers });
    }

    // Get auth token
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error: "Missing auth token",
        }),
        {
          status: 401,
          headers,
        }
      );
    }

    // Client with logged-in user JWT
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Admin client
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get logged-in user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        {
          status: 401,
          headers,
        }
      );
    }

    // Fetch profile
    const { data: currentProfile, error: currentProfileError } =
      await admin
        .from("profiles")
        .select("roles")
        .eq("id", user.id)
        .single();

    if (
      currentProfileError ||
      !currentProfile?.roles?.includes("ADMIN")
    ) {
      return new Response(
        JSON.stringify({
          error: "Admin access required",
        }),
        {
          status: 403,
          headers,
        }
      );
    }

    // Parse request body
    const body = await req.json();

    const {
      email,
      username,
      color,
      team_id,
      roles,
    } = body;

    // Validation
    if (!email || !username) {
      return new Response(
        JSON.stringify({
          error: "Email and username required",
        }),
        {
          status: 400,
          headers,
        }
      );
    }

    // Create auth user
    const {
      data: createdUser,
      error: createError,
    } = await admin.auth.admin.createUser({
      email,
      password: "Temp@12345",
      email_confirm: true,
    });

    if (createError) {
      return new Response(
        JSON.stringify({
          error: createError.message,
        }),
        {
          status: 400,
          headers,
        }
      );
    }

    // Create / update profile
    const { error: profileError } = await admin
      .from("profiles")
      .upsert({
        id: createdUser.user.id,
        email,
        username,
        color: color || "#00e5ff",
        team_id: team_id || null,

        is_admin: roles?.includes("ADMIN") || false,

        total_itrs: 0,
        battle_wins: 0,
        must_change_password: true,

        roles:
          roles && roles.length > 0
            ? roles
            : ["PLAYER"],
      });

    if (profileError) {
      return new Response(
        JSON.stringify({
          error: profileError.message,
        }),
        {
          status: 400,
          headers,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "User created successfully",
        temporaryPassword: "Temp@12345",
      }),
      {
        status: 200,
        headers,
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err.message || "Something went wrong",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
});