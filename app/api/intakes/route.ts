// app/api/intakes/route.ts
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const OWNER_COLUMN = "user_id"; // ✓ confirmed from your schema

// ─────────────────────────────────────────────────────────
//  Admin client — uses service role key, bypasses RLS.
//  Safe here because we manually scope every write to the
//  authenticated user's ID (set from getUser() result).
//  NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY must be in .env.local
//  — get it from Supabase Dashboard → Settings → API → service_role
// ─────────────────────────────────────────────────────────
function createAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // ← NOT prefixed NEXT_PUBLIC_ (server-only)
  );
}

// GET /api/intakes — fetch all intakes for the authenticated user
export async function GET() {
  try {
    const supabase = await createClient();

    // Verify identity via cookie session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Read with the user client — GET works fine because RLS SELECT policy
    // uses auth.uid() which is set from the cookie session
    const { data, error } = await supabase
      .from("intakes")
      .select("*")
      .eq(OWNER_COLUMN, user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase intakes fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("GET /api/intakes unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/intakes — create a new intake
// POST /api/intakes — create a new intake
export async function POST(request: Request) {
  try {
    // Step 1: verify identity with the cookie-based client
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Step 2: explicitly map fields to match your schema
    const intakeData = {
      user_id: user.id,
      client_first_name: body.client_first_name,
      client_last_name: body.client_last_name,
      client_email: body.client_email || null,
      client_phone: body.client_phone || null,
      case_type: body.case_type,
      case_data: body.case_data || {}, // ✅ Use 'case_data' not 'client_data'
      status: "draft",
    };

    // Step 3: use the admin client for the insert
    const admin = createAdmin();

    const { data, error } = await admin
      .from("intakes")
      .insert(intakeData)
      .select()
      .single();

    if (error) {
      console.error("Supabase intake insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("POST /api/intakes unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH /api/intakes/:id — update an intake
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing intake id" }, { status: 400 });
    }

    // Delete user_id from updates — never allow ownership transfer
    delete updates[OWNER_COLUMN];

    const admin = createAdmin();

    const { data, error } = await admin
      .from("intakes")
      .update(updates)
      .eq("id", id)
      .eq(OWNER_COLUMN, user.id) // scope to owner even with admin client
      .select()
      .single();

    if (error) {
      console.error("Supabase intake update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("PATCH /api/intakes unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
