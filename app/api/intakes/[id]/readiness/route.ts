import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Case type configurations
const caseTypeConfigs: Record<
  string,
  { required: string[]; optional: string[] }
> = {
  personal_injury: {
    required: [
      "incident_date",
      "injury_description",
      "medical_providers",
      "liability_description",
    ],
    optional: ["police_report", "witnesses", "property_damage_photos"],
  },
  family: {
    required: [
      "opposing_party_name",
      "children_info",
      "marriage_date",
      "asset_description",
    ],
    optional: [
      "prenuptial_agreement",
      "property_valuation",
      "custody_preferences",
    ],
  },
  criminal_defense: {
    required: [
      "charges",
      "arrest_date",
      "prior_convictions",
      "incident_description",
    ],
    optional: ["witness_statements", "evidence_photos", "bail_status"],
  },
  immigration: {
    required: [
      "visa_type",
      "country_of_origin",
      "current_status",
      "filing_deadline",
    ],
    optional: ["prior_applications", "dependents_info", "criminal_history"],
  },
  estate_planning: {
    required: [
      "will_exists",
      "beneficiaries",
      "executor_name",
      "assets_description",
    ],
    optional: ["trust_info", "healthcare_directive", "power_of_attorney"],
  },
};

function checkReadiness(intake: any, documents: any[]) {
  const config = caseTypeConfigs[intake.case_type];
  if (!config) {
    return { missing: [], completed: [], score: 0 };
  }

  const caseData = intake.case_data || {};
  const missing = [];
  const completed = [];

  // Check required fields
  for (const field of config.required) {
    const hasValue = caseData[field] && caseData[field] !== "";
    const hasDocument = documents.some((doc) =>
      doc.file_name.toLowerCase().includes(field.toLowerCase()),
    );

    if (hasValue || hasDocument) {
      completed.push({
        field,
        value: caseData[field] || "Uploaded document",
      });
    } else {
      missing.push({
        field,
        reason: `Required for ${intake.case_type.replace(/_/g, " ")} case`,
      });
    }
  }

  // Add optional fields that are filled
  for (const field of config.optional) {
    if (caseData[field]) {
      completed.push({
        field,
        value: caseData[field],
      });
    }
  }

  // Calculate score (0-100)
  const score = Math.round(
    (completed.filter((c) => config.required.includes(c.field)).length /
      config.required.length) *
      100,
  );

  return { missing, completed, score };
}

// GET /api/intakes/[id]/readiness
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

    const { data: report, error } = await supabase
      .from("readiness_reports")
      .select("*")
      .eq("intake_id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching report:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(report || null);
  } catch (error) {
    console.error("GET readiness error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/intakes/[id]/readiness
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    console.log("Generating report for intake:", id);

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("User ID:", user.id);

    // Get the intake
    const { data: intake, error: intakeError } = await supabase
      .from("intakes")
      .select("*")
      .eq("id", id)
      .single();

    if (intakeError) {
      console.error("Error fetching intake:", intakeError);
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    if (!intake) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    console.log("Found intake:", intake.id, "Case type:", intake.case_type);

    // Get documents
    const { data: documents } = await supabase
      .from("documents")
      .select("*")
      .eq("intake_id", id);

    console.log("Documents count:", documents?.length || 0);

    // Calculate readiness
    const { missing, completed, score } = checkReadiness(
      intake,
      documents || [],
    );

    console.log(
      "Score:",
      score,
      "Missing:",
      missing.length,
      "Completed:",
      completed.length,
    );

    // Save the report
    const { data: report, error: reportError } = await supabase
      .from("readiness_reports")
      .upsert({
        intake_id: id,
        missing_fields: missing,
        completed_fields: completed,
        overall_score: score,
        generated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (reportError) {
      console.error("Error saving report:", reportError);
      return NextResponse.json({ error: reportError.message }, { status: 500 });
    }

    // Update intake status if 100% ready
    if (score === 100) {
      await supabase
        .from("intakes")
        .update({
          status: "ready_for_review",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
    }

    // ──────────────────────────────────────────────────────────
    // SEND EMAIL NOTIFICATION
    // ──────────────────────────────────────────────────────────
    if (process.env.RESEND_API_KEY) {
      try {
        const attorneyEmail = user.email;

        if (attorneyEmail) {
          // Get readiness status text
          const statusText =
            score === 100
              ? "Ready for Consultation"
              : score >= 50
                ? "Partially Ready"
                : "Not Ready";

          const statusColor =
            score === 100 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

          const missingItemsList =
            missing.length > 0
              ? missing
                  .map(
                    (item) =>
                      `<li style="margin-bottom: 8px;">• ${item.field.replace(/_/g, " ")} - <span style="color: #dc2626;">${item.reason}</span></li>`,
                  )
                  .join("")
              : "<li>No missing items! All required fields are complete.</li>";

          const completedItemsList =
            completed.length > 0
              ? completed
                  .slice(0, 5)
                  .map(
                    (item) =>
                      `<li style="margin-bottom: 8px;">✓ ${item.field.replace(/_/g, " ")}</li>`,
                  )
                  .join("")
              : "<li>No completed items yet</li>";

          await resend.emails.send({
            from: "onboarding@resend.dev",
            to: [attorneyEmail],
            subject: `CaseReady: ${intake.client_first_name} ${intake.client_last_name} - Readiness Report (${score}%)`,
            // In the email sending section, replace the html with this:
            html: `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CaseReady Readiness Report</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">
            
            <!-- Header with Text Logo (Reliable - Same as App) -->
            <tr>
              <td style="padding: 32px 32px 0 32px; text-align: center;">
                <div style="display: inline-flex; align-items: baseline; gap: 0;">
                  <span style="font-size: 28px; font-weight: 800; letter-spacing: -0.5px; color: #111827;">Case</span>
                  <span style="font-size: 28px; font-weight: 800; letter-spacing: -0.5px; color: #3B5BDB;">Ready</span>
                </div>
                <div style="width: 50px; height: 3px; background-color: #3B5BDB; margin: 12px auto 0 auto; border-radius: 2px;"></div>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 32px;">
                <h1 style="font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 8px 0; text-align: center;">
                  Readiness Report Generated
                </h1>
                <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 0 0 24px 0;">
                  ${intake.client_first_name} ${intake.client_last_name} • ${intake.case_type.replace(/_/g, " ")}
                </p>
                
                <!-- Score Card -->
                <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                  <div style="font-size: 48px; font-weight: 700; color: ${statusColor}; margin-bottom: 8px;">
                    ${score}%
                  </div>
                  <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">Overall Readiness Score</div>
                  <div style="display: inline-block; background: ${statusColor}10; color: ${statusColor}; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                    ${statusText}
                  </div>
                  <div style="margin-top: 16px; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
                    <div style="width: ${score}%; height: 100%; background: ${statusColor}; border-radius: 4px;"></div>
                  </div>
                </div>
                
                <!-- Two Column Layout -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                  <tr>
                    <td width="50%" style="vertical-align: top; padding-right: 12px;">
                      <div style="background: #fef2f2; border-radius: 12px; padding: 16px;">
                        <h3 style="font-size: 14px; font-weight: 600; color: #dc2626; margin: 0 0 12px 0;">❌ Missing Items (${missing.length})</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 12px; line-height: 1.6;">
                          ${missingItemsList}
                        </ul>
                      </div>
                    </td>
                    <td width="50%" style="vertical-align: top; padding-left: 12px;">
                      <div style="background: #f0fdf4; border-radius: 12px; padding: 16px;">
                        <h3 style="font-size: 14px; font-weight: 600; color: #10b981; margin: 0 0 12px 0;">✅ Completed (${completed.length})</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 12px; line-height: 1.6;">
                          ${completedItemsList}
                          ${completed.length > 5 ? `<li style="color: #9ca3af;">...and ${completed.length - 5} more</li>` : ""}
                        </ul>
                      </div>
                    </td>
                  </tr>
                </table>
                
                <!-- Action Button -->
                <div style="text-align: center;">
                  <a href="https://casereadylegal.vercel.app/dashboard/intakes/${id}/readiness" 
                     style="display: inline-block; background-color: #3B5BDB; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px;">
                    View Full Report
                  </a>
                </div>
              <td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 16px 16px; text-align: center;">
                <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                  CaseReady - Professional Legal Intake Software
                </p>
                <p style="font-size: 11px; color: #d1d5db; margin: 4px 0 0 0;">
                  © ${new Date().getFullYear()} CaseReady. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </table>
      </tr>
    </table>
  </body>
  </html>
`,
          });
          console.log("Email notification sent to:", attorneyEmail);
        }
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Don't fail the request if email fails
      }
    } else {
      console.log("RESEND_API_KEY not configured, skipping email notification");
    }

    console.log("Report generated successfully");
    return NextResponse.json(report);
  } catch (error) {
    console.error("POST readiness error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + String(error) },
      { status: 500 },
    );
  }
}
