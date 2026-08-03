// app/api/public/intake/[token]/submit/route.ts
// Client form submission — split into its own file/folder so it no
// longer shares a route.ts with GET (works around the Next.js bug
// where combining GET + PUT in one file can cause GET to 405 in prod).

import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

const caseTypeFields: Record<
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
    optional: ["police_report_number", "witnesses", "insurance_info"],
  },
  family: {
    required: [
      "opposing_party_name",
      "marriage_date",
      "children_info",
      "asset_description",
    ],
    optional: [
      "prenuptial_agreement",
      "separation_date",
      "custody_preferences",
    ],
  },
  criminal_defense: {
    required: ["charges", "arrest_date", "incident_description", "court_date"],
    optional: ["prior_convictions", "bail_status", "evidence_notes"],
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
      "assets_description",
      "beneficiaries",
      "executor_name",
      "will_exists",
    ],
    optional: ["trust_info", "healthcare_directive", "power_of_attorney"],
  },
};

function calculateReadinessScore(
  caseType: string,
  caseData: Record<string, any>,
  client: {
    first_name?: string | null;
    last_name?: string | null;
  },
): number {
  const config = caseTypeFields[caseType];
  if (!config) return 0;

  const filled = (v: any) => typeof v === "string" && v.trim().length > 0;

  const requiredChecks = [
    filled(client.first_name),
    filled(client.last_name),
    ...config.required.map((f) => filled(caseData?.[f])),
  ];
  const requiredRatio =
    requiredChecks.filter(Boolean).length / requiredChecks.length;

  const optionalChecks = config.optional.map((f) => filled(caseData?.[f]));
  const optionalRatio =
    optionalChecks.length > 0
      ? optionalChecks.filter(Boolean).length / optionalChecks.length
      : 0;

  return Math.round(requiredRatio * 80 + optionalRatio * 20);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    if (!token || token.length < 10) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    const body = await request.json();

    const supabase = createAdminClient();

    const { data: existing, error: lookupError } = await supabase
      .from("intakes")
      .select("id, case_type, user_id")
      .eq("share_token", token)
      .maybeSingle();

    if (lookupError) {
      console.error("Public intake PUT — lookup error:", lookupError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!existing) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    const caseData =
      body.case_data && typeof body.case_data === "object"
        ? body.case_data
        : {};

    const readinessScore = calculateReadinessScore(
      existing.case_type,
      caseData,
      {
        first_name: body.client_first_name,
        last_name: body.client_last_name,
      },
    );

    const status = readinessScore >= 80 ? "ready_for_review" : "draft";

    const { error: updateError } = await supabase
      .from("intakes")
      .update({
        client_first_name: body.client_first_name ?? null,
        client_last_name: body.client_last_name ?? null,
        client_email: body.client_email ?? null,
        client_phone: body.client_phone ?? null,
        case_data: caseData,
        readiness_score: readinessScore,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (updateError) {
      console.error("Public intake PUT — update error:", updateError);
      return NextResponse.json(
        { error: "Failed to save your information" },
        { status: 500 },
      );
    }

    if (existing.user_id) {
      const clientName =
        [body.client_first_name, body.client_last_name]
          .filter(Boolean)
          .join(" ") || "A client";

      const { error: notifError } = await supabase
        .from("notifications")
        .insert({
          user_id: existing.user_id,
          intake_id: existing.id,
          message:
            status === "ready_for_review"
              ? `${clientName} completed their intake — readiness report is ready`
              : `${clientName} submitted intake information`,
          type: status === "ready_for_review" ? "ready" : "info",
        });

      if (notifError) {
        console.error("Public intake PUT — notification error:", notifError);
      }
    }

    return NextResponse.json({
      success: true,
      readiness_score: readinessScore,
    });
  } catch (error) {
    console.error("Public intake PUT — unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
