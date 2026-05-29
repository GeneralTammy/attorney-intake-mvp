import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    console.log("Generating PDF for intake:", id);

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get intake data
    const { data: intake, error: intakeError } = await supabase
      .from("intakes")
      .select("*")
      .eq("id", id)
      .single();

    if (intakeError || !intake) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    // Get readiness report
    const { data: report } = await supabase
      .from("readiness_reports")
      .select("*")
      .eq("intake_id", id)
      .maybeSingle();

    // Get documents
    const { data: documents } = await supabase
      .from("documents")
      .select("*")
      .eq("intake_id", id);

    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Case Readiness Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #333;
          }
          .header {
            background: linear-gradient(135deg, #1e40af, #3b82f6);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
          }
          .header p {
            margin: 0;
            opacity: 0.9;
          }
          .section {
            margin-bottom: 30px;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            overflow: hidden;
          }
          .section-title {
            background: #f9fafb;
            padding: 15px 20px;
            font-weight: bold;
            font-size: 18px;
            border-bottom: 1px solid #e5e7eb;
            color: #1f2937;
          }
          .section-content {
            padding: 20px;
          }
          .score-card {
            text-align: center;
            padding: 30px;
            background: #eff6ff;
            border-radius: 12px;
            margin-bottom: 20px;
          }
          .score-number {
            font-size: 64px;
            font-weight: bold;
            color: #2563eb;
          }
          .missing-item {
            background: #fef2f2;
            padding: 12px;
            margin-bottom: 8px;
            border-radius: 8px;
            border-left: 4px solid #ef4444;
          }
          .completed-item {
            background: #f0fdf4;
            padding: 12px;
            margin-bottom: 8px;
            border-radius: 8px;
            border-left: 4px solid #22c55e;
          }
          .info-row {
            display: flex;
            margin-bottom: 12px;
            padding: 8px;
            border-bottom: 1px solid #f3f4f6;
          }
          .info-label {
            font-weight: bold;
            width: 150px;
            color: #6b7280;
          }
          .info-value {
            flex: 1;
            color: #1f2937;
          }
          .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header">
          <h1>Case Readiness Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>

        <!-- Client Information -->
        <div class="section">
          <div class="section-title">Client Information</div>
          <div class="section-content">
            <div class="info-row">
              <div class="info-label">Client Name:</div>
              <div class="info-value">${intake.client_first_name} ${intake.client_last_name}</div>
            </div>
            ${
              intake.client_email
                ? `
            <div class="info-row">
              <div class="info-label">Email:</div>
              <div class="info-value">${intake.client_email}</div>
            </div>
            `
                : ""
            }
            ${
              intake.client_phone
                ? `
            <div class="info-row">
              <div class="info-label">Phone:</div>
              <div class="info-value">${intake.client_phone}</div>
            </div>
            `
                : ""
            }
            <div class="info-row">
              <div class="info-label">Case Type:</div>
              <div class="info-value">${intake.case_type.replace(/_/g, " ").toUpperCase()}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Created:</div>
              <div class="info-value">${new Date(intake.created_at).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        <!-- Readiness Score -->
        <div class="score-card">
          <div class="score-number">${report?.overall_score || 0}%</div>
          <div style="margin-top: 8px; color: #6b7280;">Overall Readiness Score</div>
        </div>

        <!-- Missing Information -->
        ${
          report?.missing_fields && report.missing_fields.length > 0
            ? `
        <div class="section">
          <div class="section-title" style="background: #fef2f2; color: #dc2626;">❌ Missing Information (${report.missing_fields.length})</div>
          <div class="section-content">
            ${report.missing_fields
              .map(
                (item: any) => `
              <div class="missing-item">
                <strong>${item.field.replace(/_/g, " ").toUpperCase()}</strong><br>
                <small>${item.reason}</small>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
        `
            : ""
        }

        <!-- Completed Information -->
        ${
          report?.completed_fields && report.completed_fields.length > 0
            ? `
        <div class="section">
          <div class="section-title" style="background: #f0fdf4; color: #16a34a;">✅ Completed Information (${report.completed_fields.length})</div>
          <div class="section-content">
            ${report.completed_fields
              .map(
                (item: any) => `
              <div class="completed-item">
                <strong>${item.field.replace(/_/g, " ").toUpperCase()}</strong><br>
                <small>${typeof item.value === "string" ? item.value.substring(0, 100) : "Provided"}</small>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
        `
            : ""
        }

        <!-- Documents -->
        ${
          documents && documents.length > 0
            ? `
        <div class="section">
          <div class="section-title">📎 Uploaded Documents (${documents.length})</div>
          <div class="section-content">
            ${documents
              .map(
                (doc: any) => `
              <div class="completed-item" style="background: #f3f4f6;">
                <strong>${doc.file_name}</strong><br>
                <small>Uploaded: ${new Date(doc.uploaded_at).toLocaleDateString()}</small>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
        `
            : ""
        }

        <!-- Footer -->
        <div class="footer">
          <p>IntakeReady - Professional Case Management Software</p>
          <p>This report is for internal use only | Generated by Case Ready</p>
        </div>
      </body>
      </html>
    `;

    // Return HTML as PDF (browser will handle print-to-PDF)
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="case-readiness-report-${intake.client_first_name}-${intake.client_last_name}.html"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
