import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    console.log("Share API called for intake ID:", id);

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("Unauthorized - no user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the intake to ensure ownership
    const { data: intake, error: intakeError } = await supabase
      .from("intakes")
      .select("share_token")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (intakeError || !intake) {
      console.log("Intake not found or access denied");
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    let shareToken = intake.share_token;

    // If no share_token exists, generate one
    if (!shareToken) {
      console.log("Generating new share token for intake:", id);
      const { data: updated, error: updateError } = await supabase
        .from("intakes")
        .update({ share_token: crypto.randomUUID() })
        .eq("id", id)
        .select("share_token")
        .single();

      if (updateError) {
        console.error("Error updating share token:", updateError);
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 },
        );
      }
      shareToken = updated.share_token;
    }

    console.log("Share token generated:", shareToken);
    return NextResponse.json({ share_token: shareToken });
  } catch (error) {
    console.error("Share token error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
