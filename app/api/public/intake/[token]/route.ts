import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    console.log("=== PUBLIC INTAKE API ===");
    console.log("Looking for token:", token);

    const supabase = await createClient();

    // First, let's get ALL intakes to debug
    const { data: allIntakes } = await supabase
      .from("intakes")
      .select("id, client_first_name, share_token");

    console.log("All intakes in DB:", allIntakes);

    // Now find the specific one
    const { data: intake, error } = await supabase
      .from("intakes")
      .select("*")
      .eq("share_token", token)
      .single();

    if (error) {
      console.error("Error:", error);
      return NextResponse.json(
        {
          error: "Intake not found",
          token_received: token,
          available_tokens: allIntakes?.map((i) => i.share_token),
        },
        { status: 404 },
      );
    }

    if (!intake) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    console.log("Found intake:", intake.id);

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
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
