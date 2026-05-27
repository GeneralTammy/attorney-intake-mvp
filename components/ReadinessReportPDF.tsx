"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Create styles (similar to CSS but for PDF)
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  header: {
    backgroundColor: "#2563eb",
    padding: 20,
    marginBottom: 20,
    borderRadius: 8,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  headerSubtitle: {
    color: "#bfdbfe",
    fontSize: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
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
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  scoreContainer: {
    backgroundColor: "#eff6ff",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#2563eb",
  },
  scoreLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  statusBadge: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusReady: {
    backgroundColor: "#dcfce7",
  },
  statusPartial: {
    backgroundColor: "#fef9c3",
  },
  statusNotReady: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  statusTextReady: {
    color: "#166534",
  },
  statusTextPartial: {
    color: "#854d0e",
  },
  statusTextNotReady: {
    color: "#991b1b",
  },
  progressBar: {
    backgroundColor: "#e2e8f0",
    height: 8,
    borderRadius: 4,
    marginTop: 12,
  },
  progressFill: {
    backgroundColor: "#2563eb",
    height: 8,
    borderRadius: 4,
  },
  completedItem: {
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  completedTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#166534",
    marginBottom: 4,
  },
  completedValue: {
    fontSize: 9,
    color: "#14532d",
  },
  missingItem: {
    backgroundColor: "#fef2f2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  missingTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#991b1b",
    marginBottom: 4,
  },
  missingReason: {
    fontSize: 9,
    color: "#7f1d1d",
  },
  documentItem: {
    backgroundColor: "#f8fafc",
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  documentText: {
    fontSize: 10,
    color: "#475569",
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
  documents: any[];
}

export default function ReadinessReportPDF({
  intake,
  report,
  documents,
}: ReadinessReportPDFProps) {
  const getStatusText = (score: number) => {
    if (score === 100) return "READY";
    if (score >= 50) return "PARTIALLY READY";
    return "NOT READY";
  };

  const getStatusStyle = (score: number) => {
    if (score === 100) return styles.statusReady;
    if (score >= 50) return styles.statusPartial;
    return styles.statusNotReady;
  };

  const getStatusTextStyle = (score: number) => {
    if (score === 100) return styles.statusTextReady;
    if (score >= 50) return styles.statusTextPartial;
    return styles.statusTextNotReady;
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Case Readiness Report</Text>
          <Text style={styles.headerSubtitle}>Generated on {currentDate}</Text>
        </View>

        {/* Client Information */}
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
              {intake.case_type.replace("_", " ").toUpperCase()}
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

        {/* Readiness Score */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Readiness Assessment</Text>

          <View style={styles.scoreContainer}>
            <Text style={styles.scoreNumber}>{report.overall_score}%</Text>
            <Text style={styles.scoreLabel}>Overall Readiness Score</Text>

            <View
              style={[styles.statusBadge, getStatusStyle(report.overall_score)]}
            >
              <Text
                style={[
                  styles.statusText,
                  getStatusTextStyle(report.overall_score),
                ]}
              >
                {getStatusText(report.overall_score)}
              </Text>
            </View>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${report.overall_score}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Documents */}
        {documents && documents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Uploaded Documents ({documents.length})
            </Text>
            {documents.map((doc: any, idx: number) => (
              <View key={idx} style={styles.documentItem}>
                <Text style={styles.documentText}>📄 {doc.file_name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Completed Fields */}
        {report.completed_fields && report.completed_fields.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              ✅ Information Provided ({report.completed_fields.length})
            </Text>
            {report.completed_fields.map((item: any, idx: number) => (
              <View key={idx} style={styles.completedItem}>
                <Text style={styles.completedTitle}>
                  {item.field.replace(/_/g, " ").toUpperCase()}
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

        {/* Missing Fields */}
        {report.missing_fields && report.missing_fields.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              ❌ Missing Information ({report.missing_fields.length})
            </Text>
            {report.missing_fields.map((item: any, idx: number) => (
              <View key={idx} style={styles.missingItem}>
                <Text style={styles.missingTitle}>
                  {item.field.replace(/_/g, " ").toUpperCase()}
                </Text>
                <Text style={styles.missingReason}>{item.reason}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            IntakeReady - Professional Case Management Software
          </Text>
          <Text style={styles.footerText}>
            This report is for internal use only | Generated by IntakeReady
          </Text>
        </View>
      </Page>
    </Document>
  );
}
