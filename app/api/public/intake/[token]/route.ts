// app/api/public/intake/[token]/route.ts
// Public intake endpoint — no auth required.
// Uses the service-role client (bypasses RLS) and exposes only safe fields.

import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────
// Case type field definitions (must match the form configs)
// ─────────────────────────────────────────────────────────────

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

// Required fields = 80% of score, optional fields = 20%
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

  // Required: client name fields + case required fields
  const requiredChecks = [
    filled(client.first_name),
    filled(client.last_name),
    ...config.required.map((f) => filled(caseData?.[f])),
  ];
  const requiredRatio =
    requiredChecks.filter(Boolean).length / requiredChecks.length;

  // Optional: case optional fields
  const optionalChecks = config.optional.map((f) => filled(caseData?.[f]));
  const optionalRatio =
    optionalChecks.length > 0
      ? optionalChecks.filter(Boolean).length / optionalChecks.length
      : 0;

  return Math.round(requiredRatio * 80 + optionalRatio * 20);
}

// ─────────────────────────────────────────────────────────────
// GET — load intake by share token (client opens the link)
// ─────────────────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    if (!token || token.length < 10) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    const supabase = createAdminClient();

    const { data: intake, error } = await supabase
      .from("intakes")
      .select(
        "id, client_first_name, client_last_name, client_email, client_phone, case_type, case_data",
      )
      .eq("share_token", token)
      .maybeSingle();

    if (error) {
      console.error("Public intake GET — database error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!intake) {
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
    console.error("Public intake GET — unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ─────────────────────────────────────────────────────────────
// PUT — client submits the form
// ─────────────────────────────────────────────────────────────

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

    // Confirm the token maps to a real intake before writing anything
    const { data: existing, error: lookupError } = await supabase
      .from("intakes")
      .select("id, case_type")
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

    const { error: updateError } = await supabase
      .from("intakes")
      .update({
        client_first_name: body.client_first_name ?? null,
        client_last_name: body.client_last_name ?? null,
        client_email: body.client_email ?? null,
        client_phone: body.client_phone ?? null,
        case_data: caseData,
        readiness_score: readinessScore,
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
