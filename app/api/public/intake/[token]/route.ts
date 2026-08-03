// app/api/public/intake/[token]/route.ts
// Public intake endpoint — GET only now (PUT moved to ./submit/route.ts
// to work around a Next.js bug where combining GET + PUT in one route
// file can cause GET to incorrectly return 405 in production).

import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    if (!token || token.length < 10) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    const supabase = createAdminClient();

    const { data: intake, error } = await supabase
      .from("intakes")
      .select(
        "id, client_first_name, client_last_name, client_email, client_phone, case_type, case_data",
      )
      .eq("share_token", token)
      .maybeSingle();

    if (error) {
      console.error("Public intake GET — database error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!intake) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: intake.id,
      client_first_name: intake.client_first_name,
      client_last_name: intake.client_last_name,
      client_email: intake.client_email,
      client_phone: intake.client_phone,
      case_type: intake.case_type,
      case_data: intake.case_data || {},
    });
  } catch (error) {
    console.error("Public intake GET — unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
