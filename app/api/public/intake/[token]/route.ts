// app/api/public/intake/[token]/upload/route.ts
// Public file upload — no auth required, validated via share_token.
// Uses the admin client (bypasses RLS), same pattern as the existing
// public intake GET/PUT routes.

import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    if (!token || token.length < 10) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    const supabase = createAdminClient();

    // Look up the intake by share_token — same check as the existing
    // public GET/PUT routes.
    const { data: intake, error: lookupError } = await supabase
      .from("intakes")
      .select("id, user_id")
      .eq("share_token", token)
      .maybeSingle();

    if (lookupError) {
      console.error("Public upload — lookup error:", lookupError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!intake) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 10MB limit" },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF, JPG, and PNG files are allowed" },
        { status: 400 },
      );
    }

    // Folder convention: {attorney_id}/{intake_id}/{filename}
    const filePath = `${intake.user_id}/${intake.id}/${Date.now()}_${file.name}`;
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from("intake-documents")
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Public upload — storage error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: fileRecord, error: dbError } = await supabase
      .from("intake_files")
      .insert({
        intake_id: intake.id,
        attorney_id: intake.user_id,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        content_type: file.type,
        uploaded_by: "client",
      })
      .select()
      .single();

    if (dbError) {
      console.error("Public upload — db error:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // Notify the attorney, same non-blocking pattern as the PUT route
    if (intake.user_id) {
      const { error: notifError } = await supabase
        .from("notifications")
        .insert({
          user_id: intake.user_id,
          intake_id: intake.id,
          message: `A client uploaded a document: ${file.name}`,
          type: "info",
        });
      if (notifError) {
        console.error("Public upload — notification error:", notifError);
      }
    }

    return NextResponse.json({ success: true, file: fileRecord });
  } catch (error) {
    console.error("Public upload — unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
