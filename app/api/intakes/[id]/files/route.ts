// app/api/intakes/[id]/files/route.ts
// Attorney-facing file list — requires auth + ownership check,
// same pattern as the existing GET/PATCH/DELETE in
// app/api/intakes/[id]/route.ts

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Confirm the intake belongs to this attorney before listing files
    const { data: intake, error: intakeError } = await supabase
      .from("intakes")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (intakeError || !intake) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    if (intake.user_id !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { data: files, error: filesError } = await supabase
      .from("intake_files")
      .select(
        "id, file_name, file_path, file_size, content_type, uploaded_by, created_at",
      )
      .eq("intake_id", id)
      .order("created_at", { ascending: false });

    if (filesError) {
      console.error("Files list — db error:", filesError);
      return NextResponse.json({ error: filesError.message }, { status: 500 });
    }

    // Generate signed URLs (valid 1 hour) for each file
    const filesWithUrls = await Promise.all(
      (files || []).map(async (f) => {
        const { data: signed } = await supabase.storage
          .from("intake-documents")
          .createSignedUrl(f.file_path, 3600);
        return { ...f, signed_url: signed?.signedUrl ?? null };
      }),
    );

    return NextResponse.json({ files: filesWithUrls });
  } catch (error) {
    console.error("Files list — unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
