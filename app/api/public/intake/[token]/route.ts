import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    const supabase = await createClient();

    const { data: intake, error } = await supabase
      .from("intakes")
      .select("*")
      .eq("share_token", token)
      .single();

    if (error || !intake) {
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
    console.error("GET public intake error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const {
      client_first_name,
      client_last_name,
      client_email,
      client_phone,
      case_data,
    } = body;

    const supabase = await createClient();

    const updateData: any = {
      case_data: case_data || {},
      updated_at: new Date().toISOString(),
    };

    if (client_first_name) updateData.client_first_name = client_first_name;
    if (client_last_name) updateData.client_last_name = client_last_name;
    if (client_email !== undefined) updateData.client_email = client_email;
    if (client_phone !== undefined) updateData.client_phone = client_phone;

    const { data: intake, error } = await supabase
      .from("intakes")
      .update(updateData)
      .eq("share_token", token)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, intake });
  } catch (error) {
    console.error("PUT public intake error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
