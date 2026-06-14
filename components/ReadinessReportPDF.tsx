"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Brand: matches the app's #3B5BDB primary and score thresholds
const BRAND = "#3B5BDB";

function scoreHex(score: number) {
  return score >= 80 ? "#12A06E" : score >= 50 ? "#C97A0A" : "#C93B3B";
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  header: {
    backgroundColor: BRAND,
    padding: 20,
    marginBottom: 20,
    borderRadius: 8,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
  },
  headerSubtitle: {
    color: "#DDE4FF",
    fontSize: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: BRAND,
    paddingBottom: 4,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  infoLabel: {
    width: 120,
    fontSize: 10,
    color: "#64748b",
    marginBottom: 4,
  },
  infoValue: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  scoreContainer: {
    backgroundColor: "#F4F6FB",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  scoreNumber: {
    fontSize: 48,
    fontFamily: "Helvetica-Bold",
  },
  scoreLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  statusBadge: {
    marginTop: 10,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
  progressBar: {
    backgroundColor: "#e2e8f0",
    height: 8,
    borderRadius: 4,
    marginTop: 12,
    width: "100%",
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  completedItem: {
    backgroundColor: "#F7F8FB",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#12A06E",
  },
  completedTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  completedValue: {
    fontSize: 9,
    color: "#475569",
  },
  missingItem: {
    backgroundColor: "#FFF8EB",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#C97A0A",
  },
  missingTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#7A5008",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  missingReason: {
    fontSize: 9,
    color: "#9A6B14",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: "#94a3b8",
    textAlign: "center",
  },
});

interface ReadinessReportPDFProps {
  intake: any;
  report: any;
  documents?: any[];
}

function formatCaseType(raw: string) {
  const types: Record<string, string> = {
    personal_injury: "Personal Injury",
    family: "Family Law",
    criminal_defense: "Criminal Defense",
    immigration: "Immigration",
    estate_planning: "Estate Planning",
  };
  return types[raw] || raw.replace(/_/g, " ");
}

export default function ReadinessReportPDF({
  intake,
  report,
  documents = [],
}: ReadinessReportPDFProps) {
  const score = report.overall_score ?? 0;
  const color = scoreHex(score);

  // ≥80 = required portion complete, matching the rest of the app
  const statusText =
    score >= 80
      ? "READY FOR CONSULTATION"
      : score >= 50
        ? "PARTIALLY READY"
        : "NOT READY";

  const statusBg =
    score >= 80 ? "#DCFCE7" : score >= 50 ? "#FEF9C3" : "#FEE2E2";

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Case Readiness Report</Text>
          <Text style={styles.headerSubtitle}>
            {intake.client_first_name} {intake.client_last_name} ·{" "}
            {formatCaseType(intake.case_type)} · {currentDate}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Information</Text>

          <View style={styles.infoGrid}>
            <Text style={styles.infoLabel}>Client Name:</Text>
            <Text style={styles.infoValue}>
              {intake.client_first_name} {intake.client_last_name}
            </Text>
          </View>

          <View style={styles.infoGrid}>
            <Text style={styles.infoLabel}>Case Type:</Text>
            <Text style={styles.infoValue}>
              {formatCaseType(intake.case_type)}
            </Text>
          </View>

          {intake.client_email && (
            <View style={styles.infoGrid}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{intake.client_email}</Text>
            </View>
          )}

          {intake.client_phone && (
            <View style={styles.infoGrid}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{intake.client_phone}</Text>
            </View>
          )}

          <View style={styles.infoGrid}>
            <Text style={styles.infoLabel}>Created:</Text>
            <Text style={styles.infoValue}>
              {new Date(intake.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Readiness Assessment</Text>

          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreNumber, { color }]}>{score}%</Text>
            <Text style={styles.scoreLabel}>Overall Readiness Score</Text>

            <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
              <Text style={[styles.statusText, { color }]}>{statusText}</Text>
            </View>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${score}%`, backgroundColor: color },
                ]}
              />
            </View>
          </View>
        </View>

        {report.completed_fields && report.completed_fields.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Information Provided ({report.completed_fields.length})
            </Text>
            {report.completed_fields.map((item: any, idx: number) => (
              <View key={idx} style={styles.completedItem}>
                <Text style={styles.completedTitle}>
                  {item.field.replace(/_/g, " ")}
                </Text>
                <Text style={styles.completedValue}>
                  {typeof item.value === "string"
                    ? item.value.length > 150
                      ? item.value.substring(0, 150) + "..."
                      : item.value
                    : "Provided"}
                </Text>
              </View>
            ))}
          </View>
        )}

        {report.missing_fields && report.missing_fields.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Missing Information ({report.missing_fields.length})
            </Text>
            {report.missing_fields.map((item: any, idx: number) => (
              <View key={idx} style={styles.missingItem}>
                <Text style={styles.missingTitle}>
                  {item.field.replace(/_/g, " ")}
                </Text>
                <Text style={styles.missingReason}>{item.reason}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            CaseReady — Professional Legal Intake Software
          </Text>
          <Text style={styles.footerText}>
            Confidential — for attorney use only
          </Text>
        </View>
      </Page>
    </Document>
  );
}
