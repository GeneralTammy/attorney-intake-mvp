import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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

// Helper function to check readiness
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
