import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    console.log("🔍 Looking for token:", token);

    const supabase = await createClient();

    // Use .eq() with maybeSingle() to avoid errors
    const { data: intake, error } = await supabase
      .from("intakes")
      .select("*")
      .eq("share_token", token)
      .maybeSingle();

    if (error) {
      console.error("❌ Database error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!intake) {
      console.log("❌ No intake found for token:", token);
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    console.log("✅ Found intake:", intake.id);

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
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
