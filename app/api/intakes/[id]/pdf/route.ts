import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

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

    // Exact CaseReady briefcase logo (white version for dark header)
    const logoSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      </svg>
      <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 20px; font-weight: 700; color: white; letter-spacing: -0.3px; margin-left: 10px;">CaseReady</span>
    `;

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
            background: linear-gradient(135deg, #1e3a8a, #3B5BDB);
            color: white;
            padding: 28px 30px;
            border-radius: 12px;
            margin-bottom: 30px;
          }
          .header-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
          }
          .header-logo {
            display: flex;
            align-items: center;
          }
          .header-meta {
            text-align: right;
            opacity: 0.85;
            font-size: 13px;
          }
          .header-title {
            font-size: 22px;
            font-weight: 700;
            margin: 0;
            letter-spacing: -0.3px;
          }
          .header-subtitle {
            margin: 4px 0 0 0;
            opacity: 0.85;
            font-size: 14px;
          }
          .divider {
            border: none;
            border-top: 1px solid rgba(255,255,255,0.25);
            margin: 14px 0 16px 0;
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
            color: #3B5BDB;
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
          .footer-logo {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 6px;
          }
          .footer-logo svg {
            vertical-align: middle;
          }
        </style>
      </head>
      <body>

        <!-- Header with logo -->
        <div class="header">
          <div class="header-top">
            <div class="header-logo">
              ${logoSVG}
            </div>
            <div class="header-meta">
              Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
          <hr class="divider" />
          <h1 class="header-title">Case Readiness Report</h1>
          <p class="header-subtitle">${intake.client_first_name} ${intake.client_last_name} &mdash; ${intake.case_type.replace(/_/g, " ").toUpperCase()}</p>
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
          <div class="footer-logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            <span style="color: #6b7280; font-weight: 600;">CaseReady</span>
          </div>
          <p style="margin: 4px 0 0 0;">Professional Case Management &nbsp;&bull;&nbsp; This report is for internal use only</p>
        </div>

      </body>
      </html>
    `;

    // Send notification email to the attorney
    // Note: onboarding@resend.dev can only deliver to your verified Resend account email.
    // Once you add a verified domain in Resend, update FROM_EMAIL in .env and remove this sender.
    if (user.email) {
      const score = report?.overall_score || 0;
      const scoreColor =
        score >= 80 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626";
      const clientName = `${intake.client_first_name} ${intake.client_last_name}`;
      const caseType = intake.case_type.replace(/_/g, " ").toUpperCase();

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; margin: 0; padding: 0; }
            .wrapper { max-width: 560px; margin: 40px auto; padding: 0 20px; }
            .card { background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; }
            .header { background: linear-gradient(135deg, #1e3a8a, #3B5BDB); padding: 28px 30px; }
            .logo { display: flex; align-items: center; gap: 10px; margin-bottom: 0; }
            .logo-text { font-family: Georgia, serif; font-size: 20px; font-weight: 700; color: white; letter-spacing: -0.3px; }
            .body { padding: 32px 30px; }
            .score-badge { display: inline-block; font-size: 40px; font-weight: 700; color: ${scoreColor}; margin: 16px 0; }
            .score-label { font-size: 14px; color: #6b7280; margin-top: -8px; }
            .detail-row { display: flex; padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
            .detail-label { color: #6b7280; width: 120px; flex-shrink: 0; }
            .detail-value { color: #111827; font-weight: 500; }
            .cta { display: inline-block; background: #3B5BDB; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 24px; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="card">
              <div class="header">
                <div class="logo">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                  <span class="logo-text">CaseReady</span>
                </div>
              </div>
              <div class="body">
                <p style="margin: 0 0 4px 0; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Readiness Report Ready</p>
                <h2 style="margin: 0 0 20px 0; font-size: 22px; color: #111827;">${clientName}</h2>

                <div class="detail-row">
                  <span class="detail-label">Case Type</span>
                  <span class="detail-value">${caseType}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Generated</span>
                  <span class="detail-value">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                </div>
                ${
                  intake.client_email
                    ? `
                <div class="detail-row">
                  <span class="detail-label">Client Email</span>
                  <span class="detail-value">${intake.client_email}</span>
                </div>`
                    : ""
                }

                <div style="margin-top: 24px; padding: 20px; background: #f9fafb; border-radius: 8px; text-align: center;">
                  <div class="score-badge">${score}%</div>
                  <div class="score-label">Overall Readiness Score</div>
                </div>

                ${
                  report?.missing_fields?.length > 0
                    ? `
                <p style="margin: 20px 0 8px 0; font-size: 14px; color: #dc2626; font-weight: 600;">
                  ${report.missing_fields.length} item${report.missing_fields.length > 1 ? "s" : ""} still missing
                </p>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #6b7280;">
                  ${report.missing_fields
                    .slice(0, 3)
                    .map((f: any) => `<li>${f.field.replace(/_/g, " ")}</li>`)
                    .join("")}
                  ${report.missing_fields.length > 3 ? `<li>and ${report.missing_fields.length - 3} more…</li>` : ""}
                </ul>`
                    : `
                <p style="margin: 20px 0 0 0; font-size: 14px; color: #16a34a; font-weight: 600;">✅ All fields complete</p>`
                }

                <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://casereadylegal.vercel.app"}/dashboard/intakes/${id}" class="cta">
                  View Full Report
                </a>
              </div>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} CaseReady &bull; Professional Case Management</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Fire and forget — don't block the PDF download if email fails
      sendEmail({
        to: user.email,
        subject: `Report ready: ${clientName} — ${score}% readiness`,
        html: emailHtml,
        from: "onboarding@resend.dev",
      }).catch((err) =>
        console.error("Attorney notification email failed:", err),
      );
    }

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
