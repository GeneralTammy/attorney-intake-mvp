import { CaseTypeConfig } from "@/types";

export const caseTypeConfigs: Record<string, CaseTypeConfig> = {
  personal_injury: {
    label: "Personal Injury",
    required: [
      "incident_date",
      "injury_description",
      "medical_providers",
      "liability_description",
    ],
    optional: ["police_report", "witnesses", "property_damage_photos"],
  },
  family: {
    label: "Family Law",
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
    label: "Criminal Defense",
    required: [
      "charges",
      "arrest_date",
      "prior_convictions",
      "incident_description",
    ],
    optional: ["witness_statements", "evidence_photos", "bail_status"],
  },
};

export function checkReadiness(
  intake: any,
  documents: any[],
): { missing: any[]; completed: any[]; score: number } {
  const config = caseTypeConfigs[intake.case_type];
  if (!config) {
    return { missing: [], completed: [], score: 0 };
  }

  const caseData = intake.case_data;
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
        reason: `Required for ${config.label} case`,
      });
    }
  }

  // Check optional fields (just track for info, don't penalize)
  for (const field of config.optional) {
    if (caseData[field]) {
      completed.push({
        field,
        value: caseData[field],
      });
    }
  }

  const score = Math.round(
    (completed.filter((c) => config.required.includes(c.field)).length /
      config.required.length) *
      100,
  );

  return { missing, completed, score };
}
