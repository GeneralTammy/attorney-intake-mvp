"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { addNotification } from "@/lib/notifications";
import {
  ArrowLeft,
  Briefcase,
  ChevronDown,
  FileText,
  User,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle2,
  Save,
  AlertTriangle,
  LayoutDashboard,
  PlusCircle,
  LogOut,
  Menu,
  X,
  Settings,
} from "lucide-react";

const B = "#3B5BDB";
const BH = "#2F4AC2";
const BT = "#EEF2FF";

// ─── Case Type Configurations ─────────────────────────────
const caseTypeConfigs: Record<
  string,
  {
    label: string;
    icon: React.ReactNode;
    required: string[];
    optional: string[];
    description: string;
    fieldTypes: Record<string, "text" | "date" | "textarea">;
    fieldPlaceholders: Record<string, string>;
  }
> = {
  personal_injury: {
    label: "Personal Injury",
    icon: <AlertTriangle size={18} />,
    description: "Accidents, injuries, liability claims",
    required: [
      "incident_date",
      "injury_description",
      "medical_providers",
      "liability_description",
    ],
    optional: ["police_report_number", "witnesses", "insurance_info"],
    fieldTypes: {
      incident_date: "date",
      injury_description: "textarea",
      medical_providers: "text",
      liability_description: "textarea",
      police_report_number: "text",
      witnesses: "textarea",
      insurance_info: "text",
    },
    fieldPlaceholders: {
      injury_description:
        "Describe the injuries sustained, severity, body parts affected...",
      medical_providers: "e.g., General Hospital, Dr. Smith",
      liability_description:
        "Describe how the accident occurred and who was at fault...",
      police_report_number: "e.g., RPT-2024-00123",
      witnesses: "Names and phone numbers of any witnesses...",
      insurance_info: "e.g., State Farm, Policy #12345",
    },
  },
  family: {
    label: "Family Law",
    icon: <User size={18} />,
    description: "Divorce, custody, child support",
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
    fieldTypes: {
      opposing_party_name: "text",
      marriage_date: "date",
      children_info: "textarea",
      asset_description: "textarea",
      prenuptial_agreement: "text",
      separation_date: "date",
      custody_preferences: "textarea",
    },
    fieldPlaceholders: {
      opposing_party_name: "e.g., Jane Smith",
      children_info: "Names and ages of children involved...",
      asset_description: "Describe shared property, accounts, or assets...",
      prenuptial_agreement: "e.g., Yes — signed, or None",
      custody_preferences: "Describe desired custody arrangement...",
    },
  },
  criminal_defense: {
    label: "Criminal Defense",
    icon: <AlertCircle size={18} />,
    description: "Charges, arrests, defense strategy",
    required: ["charges", "arrest_date", "incident_description", "court_date"],
    optional: ["prior_convictions", "bail_status", "evidence_notes"],
    fieldTypes: {
      charges: "text",
      arrest_date: "date",
      incident_description: "textarea",
      court_date: "date",
      prior_convictions: "textarea",
      bail_status: "text",
      evidence_notes: "textarea",
    },
    fieldPlaceholders: {
      charges: "e.g., DUI, Assault, Possession",
      incident_description:
        "Describe what happened from the client's perspective...",
      prior_convictions: "List any prior criminal history...",
      bail_status: "e.g., Released on bail, Held in custody",
      evidence_notes: "Any known evidence or witnesses...",
    },
  },
  immigration: {
    label: "Immigration",
    icon: <FileText size={18} />,
    description: "Visas, green cards, citizenship",
    required: [
      "visa_type",
      "country_of_origin",
      "current_status",
      "filing_deadline",
    ],
    optional: ["prior_applications", "dependents_info", "criminal_history"],
    fieldTypes: {
      visa_type: "text",
      country_of_origin: "text",
      current_status: "text",
      filing_deadline: "date",
      prior_applications: "textarea",
      dependents_info: "textarea",
      criminal_history: "text",
    },
    fieldPlaceholders: {
      visa_type: "e.g., H-1B, F-1, Green Card, Asylum",
      country_of_origin: "e.g., Mexico, India, Nigeria",
      current_status: "e.g., Undocumented, F-1 student, H-1B worker",
      prior_applications: "Any previous USCIS applications or denials...",
      dependents_info: "Names and relationship of any dependents...",
      criminal_history: "e.g., None, or describe briefly",
    },
  },
  estate_planning: {
    label: "Estate Planning",
    icon: <Save size={18} />,
    description: "Wills, trusts, power of attorney",
    required: [
      "assets_description",
      "beneficiaries",
      "executor_name",
      "will_exists",
    ],
    optional: ["trust_info", "healthcare_directive", "power_of_attorney"],
    fieldTypes: {
      assets_description: "textarea",
      beneficiaries: "textarea",
      executor_name: "text",
      will_exists: "text",
      trust_info: "textarea",
      healthcare_directive: "text",
      power_of_attorney: "text",
    },
    fieldPlaceholders: {
      assets_description:
        "Real estate, bank accounts, investments, vehicles...",
      beneficiaries: "Names and relationship to client...",
      executor_name: "Full name of the executor",
      will_exists: "e.g., No existing will / Yes — needs updating",
      trust_info: "Details about any existing or desired trusts...",
      healthcare_directive: "e.g., Not needed / Needed — new",
      power_of_attorney: "e.g., Not needed / Needed — new",
    },
  },
};

function formatFieldName(field: string): string {
  return field
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function calcScore(
  caseType: string,
  caseData: Record<string, string>,
  clientFirst: string,
  clientLast: string,
): { score: number; completedRequired: number; totalRequired: number } {
  const config = caseTypeConfigs[caseType];
  if (!config) return { score: 0, completedRequired: 0, totalRequired: 0 };

  const clientComplete =
    (clientFirst.trim() ? 1 : 0) + (clientLast.trim() ? 1 : 0);
  const totalRequired = config.required.length + 2;
  const completedRequired =
    clientComplete + config.required.filter((k) => caseData[k]?.trim()).length;

  const totalOptional = config.optional.length;
  const completedOptional = config.optional.filter((k) =>
    caseData[k]?.trim(),
  ).length;

  const requiredScore =
    totalRequired > 0 ? (completedRequired / totalRequired) * 80 : 0;
  const optionalScore =
    totalOptional > 0 ? (completedOptional / totalOptional) * 20 : 20;

  return {
    score: Math.round(requiredScore + optionalScore),
    completedRequired,
    totalRequired,
  };
}

function ScoreRing({ score }: { score: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#12A06E" : score >= 50 ? "#C97A0A" : "#C93B3B";

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 108 108" className="w-full h-full -rotate-90">
        <circle
          cx="54"
          cy="54"
          r={r}
          fill="none"
          stroke="#F0F0F5"
          strokeWidth="9"
        />
        <circle
          cx="54"
          cy="54"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold leading-none" style={{ color }}>
          {score}%
        </span>
        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-1">
          Ready
        </span>
      </div>
    </div>
  );
}

// ─── Sidebar Components ──────────────────────────────────────
function MobileSidebar({
  userName,
  onSignOut,
  isOpen,
  onClose,
}: {
  userName: string;
  onSignOut: () => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/intakes/new", label: "New Intake", icon: PlusCircle },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        onClick={onClose}
      />
      <aside className="fixed top-0 left-0 h-full w-72 bg-white z-50 flex flex-col shadow-xl lg:hidden">
        <div className="px-5 py-5 border-b border-gray-100 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3B5BDB] flex items-center justify-center">
              <Briefcase size={15} className="text-white" />
            </div>
            <span className="font-semibold text-base text-gray-900">
              Case<span className="text-[#3B5BDB]">Ready</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center">
              <span className="text-[#3B5BDB] text-sm font-medium">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-400">Solo Practitioner</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-0.5">
          <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-3 pb-2">
            Main
          </div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
            >
              <item.icon size={16} className="text-gray-400" /> {item.label}
            </Link>
          ))}
          <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-3 pb-2 pt-6">
            Account
          </div>
          <Link
            href="/dashboard/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
          >
            <Settings size={16} className="text-gray-400" />
            Settings
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => {
              onSignOut();
              onClose();
            }}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

function DesktopSidebar({
  userName,
  onSignOut,
}: {
  userName: string;
  onSignOut: () => void;
}) {
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/intakes/new", label: "New Intake", icon: PlusCircle },
  ];

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-50 flex-col hidden lg:flex">
      <div className="px-5 py-5 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#3B5BDB] flex items-center justify-center">
            <Briefcase size={15} className="text-white" />
          </div>
          <span className="font-semibold text-base text-gray-900">
            Case<span className="text-[#3B5BDB]">Ready</span>
          </span>
        </Link>
      </div>
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center">
            <span className="text-[#3B5BDB] text-sm font-medium">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-400">Solo Practitioner</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-3 pb-2">
          Main
        </div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
              item.href === "/dashboard/intakes/new"
                ? "bg-[#EEF2FF] text-[#3B5BDB] font-medium"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <item.icon
              size={16}
              className={
                item.href === "/dashboard/intakes/new"
                  ? "text-[#3B5BDB]"
                  : "text-gray-400"
              }
            />{" "}
            {item.label}
          </Link>
        ))}
        <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-3 pb-2 pt-6">
          Account
        </div>
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
        >
          <Settings size={16} className="text-gray-400" />
          Settings
        </Link>
      </nav>
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  );
}

// ─── Main Component ───────────────────────────────────────
export default function NewIntakePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState<string>("Attorney");
  const [showValidation, setShowValidation] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    client_first_name: "",
    client_last_name: "",
    client_email: "",
    client_phone: "",
    case_type: "personal_injury",
    case_data: {} as Record<string, string>,
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const name =
          data.user.user_metadata?.full_name ??
          data.user.email?.split("@")[0] ??
          "Attorney";
        setUserName(name);
      }
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const currentConfig = caseTypeConfigs[formData.case_type];
  const { score, completedRequired, totalRequired } = useMemo(
    () =>
      calcScore(
        formData.case_type,
        formData.case_data,
        formData.client_first_name,
        formData.client_last_name,
      ),
    [formData],
  );
  const missingRequired = currentConfig.required.filter(
    (field) => !formData.case_data[field]?.trim(),
  );
  const isClientInfoValid =
    formData.client_first_name.trim() !== "" &&
    formData.client_last_name.trim() !== "";
  const isFormValid = isClientInfoValid && missingRequired.length === 0;

  const handleCaseTypeChange = (caseType: string) => {
    setFormData({ ...formData, case_type: caseType, case_data: {} });
    setShowValidation(false);
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      case_data: { ...formData.case_data, [field]: value },
    });
  };

  const getFieldError = (field: string): boolean => {
    return (
      showValidation &&
      (!formData.case_data[field] || formData.case_data[field].trim() === "")
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);
    if (!isFormValid) {
      setError("Please complete all required fields before submitting.");
      const firstError = document.querySelector(".error-field");
      if (firstError)
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setLoading(true);
    setError("");
    const payload = {
      client_first_name: formData.client_first_name,
      client_last_name: formData.client_last_name,
      client_email: formData.client_email || null,
      client_phone: formData.client_phone || null,
      case_type: formData.case_type,
      case_data: formData.case_data,
    };
    try {
      const response = await fetch("/api/intakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create intake");
        setLoading(false);
        return;
      }
      const intake = await response.json();

      // Add notification for new intake
      addNotification({
        message: `New intake created for ${intake.client_first_name} ${intake.client_last_name}`,
        type: "info",
        intakeId: intake.id,
      });

      await fetch(`/api/intakes/${intake.id}/readiness`, { method: "POST" });

      // Add notification for report ready
      addNotification({
        message: `Readiness report for ${intake.client_first_name} ${intake.client_last_name} is ready`,
        type: "success",
        intakeId: intake.id,
      });

      router.push(`/dashboard/intakes/${intake.id}/readiness`);
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const scoreBarColor =
    score >= 80
      ? "bg-emerald-500"
      : score >= 50
        ? "bg-amber-400"
        : "bg-red-400";
  const scoreTextColor =
    score >= 80
      ? "text-emerald-600"
      : score >= 50
        ? "text-amber-600"
        : "text-red-500";

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileSidebar
        userName={userName}
        onSignOut={handleSignOut}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <DesktopSidebar userName={userName} onSignOut={handleSignOut} />

      <div className="lg:pl-64">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                >
                  <Menu size={20} />
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    New Client Intake
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Create a new case file
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition"
              >
                <ArrowLeft size={14} /> Back to Dashboard
              </Link>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Form */}
            <div className="flex-1">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle
                    size={16}
                    className="text-red-500 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-red-800">Error</p>
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                </div>
              )}
              {showValidation && !isFormValid && (
                <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle
                    size={16}
                    className="text-amber-500 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      Incomplete Form
                    </p>
                    <p className="text-xs text-amber-700">
                      Please complete all required fields before submitting.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Client Info */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="border-b border-gray-100 px-4 py-3 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-[#3B5BDB]" />
                      <h2 className="text-sm font-semibold text-gray-900">
                        Client Information
                      </h2>
                      <span className="text-[10px] text-red-500 ml-auto">
                        * Required
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.client_first_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              client_first_name: e.target.value,
                            })
                          }
                          placeholder="John"
                          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3B5BDB] ${
                            showValidation && !formData.client_first_name
                              ? "border-red-300 bg-red-50/50"
                              : "border-gray-200"
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.client_last_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              client_last_name: e.target.value,
                            })
                          }
                          placeholder="Doe"
                          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3B5BDB] ${
                            showValidation && !formData.client_last_name
                              ? "border-red-300 bg-red-50/50"
                              : "border-gray-200"
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          <Mail size={12} className="inline mr-1" /> Email
                        </label>
                        <input
                          type="email"
                          value={formData.client_email}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              client_email: e.target.value,
                            })
                          }
                          placeholder="john@example.com"
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          <Phone size={12} className="inline mr-1" /> Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.client_phone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              client_phone: e.target.value,
                            })
                          }
                          placeholder="(555) 555-5555"
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Case Details */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="border-b border-gray-100 px-4 py-3 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                      <Briefcase size={14} className="text-[#3B5BDB]" />
                      <h2 className="text-sm font-semibold text-gray-900">
                        Case Details
                      </h2>
                      <span className="text-[10px] text-red-500 ml-auto">
                        * Required
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="mb-5">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Case Type <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={formData.case_type}
                          onChange={(e) => handleCaseTypeChange(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg appearance-none bg-white"
                        >
                          <option value="personal_injury">
                            Personal Injury
                          </option>
                          <option value="family">Family Law</option>
                          <option value="criminal_defense">
                            Criminal Defense
                          </option>
                          <option value="immigration">Immigration</option>
                          <option value="estate_planning">
                            Estate Planning
                          </option>
                        </select>
                        <ChevronDown
                          size={14}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        {currentConfig.icon}
                        {currentConfig.description}
                      </p>
                    </div>

                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-4 bg-red-500 rounded-full" />
                          <h3 className="text-sm font-medium text-gray-900">
                            Required Information
                          </h3>
                        </div>
                        <span className="text-xs text-gray-400">
                          {
                            currentConfig.required.filter((k) =>
                              formData.case_data[k]?.trim(),
                            ).length
                          }
                          /{currentConfig.required.length} complete
                        </span>
                      </div>
                      <div className="space-y-4">
                        {currentConfig.required.map((field) => {
                          const isError = getFieldError(field);
                          const isFilled = !!formData.case_data[field]?.trim();
                          const fieldType =
                            currentConfig.fieldTypes[field] ?? "textarea";
                          const placeholder =
                            currentConfig.fieldPlaceholders[field] ?? "";
                          return (
                            <div
                              key={field}
                              className={isError ? "error-field" : ""}
                            >
                              <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                                {formatFieldName(field)}{" "}
                                <span className="text-red-500">*</span>
                                {isFilled && !isError && (
                                  <CheckCircle2
                                    size={12}
                                    className="text-emerald-500"
                                  />
                                )}
                              </label>
                              {fieldType === "date" ? (
                                <input
                                  type="date"
                                  value={formData.case_data[field] || ""}
                                  onChange={(e) =>
                                    handleFieldChange(field, e.target.value)
                                  }
                                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3B5BDB] ${
                                    isError
                                      ? "border-red-300 bg-red-50/50"
                                      : "border-gray-200"
                                  }`}
                                />
                              ) : fieldType === "text" ? (
                                <input
                                  type="text"
                                  value={formData.case_data[field] || ""}
                                  onChange={(e) =>
                                    handleFieldChange(field, e.target.value)
                                  }
                                  placeholder={placeholder}
                                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3B5BDB] ${
                                    isError
                                      ? "border-red-300 bg-red-50/50"
                                      : "border-gray-200"
                                  }`}
                                />
                              ) : (
                                <textarea
                                  rows={3}
                                  value={formData.case_data[field] || ""}
                                  onChange={(e) =>
                                    handleFieldChange(field, e.target.value)
                                  }
                                  placeholder={placeholder}
                                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3B5BDB] resize-none ${
                                    isError
                                      ? "border-red-300 bg-red-50/50"
                                      : "border-gray-200"
                                  }`}
                                />
                              )}
                              {isError && (
                                <p className="text-[10px] text-red-500 mt-1">
                                  {formatFieldName(field)} is required
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {currentConfig.optional.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-4 bg-gray-400 rounded-full" />
                          <h3 className="text-sm font-medium text-gray-900">
                            Optional Information
                          </h3>
                          <span className="text-[10px] text-gray-400">
                            Helpful but not required
                          </span>
                        </div>
                        <div className="space-y-4">
                          {currentConfig.optional.map((field) => {
                            const fieldType =
                              currentConfig.fieldTypes[field] ?? "textarea";
                            const placeholder =
                              currentConfig.fieldPlaceholders[field] ??
                              `Optional: ${formatFieldName(field).toLowerCase()}...`;
                            return (
                              <div key={field}>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  {formatFieldName(field)}
                                </label>
                                {fieldType === "date" ? (
                                  <input
                                    type="date"
                                    value={formData.case_data[field] || ""}
                                    onChange={(e) =>
                                      handleFieldChange(field, e.target.value)
                                    }
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]"
                                  />
                                ) : fieldType === "text" ? (
                                  <input
                                    type="text"
                                    value={formData.case_data[field] || ""}
                                    onChange={(e) =>
                                      handleFieldChange(field, e.target.value)
                                    }
                                    placeholder={placeholder}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]"
                                  />
                                ) : (
                                  <textarea
                                    rows={2}
                                    value={formData.case_data[field] || ""}
                                    onChange={(e) =>
                                      handleFieldChange(field, e.target.value)
                                    }
                                    placeholder={placeholder}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3B5BDB] resize-none"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pb-8">
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium bg-[#3B5BDB] hover:bg-[#2F4AC2] text-white rounded-lg transition shadow-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>Creating...</>
                    ) : (
                      <>
                        <Save size={14} /> Create Intake
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Readiness Panel */}
            <div className="hidden lg:block w-72 flex-shrink-0 sticky top-24">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Readiness Score
                  </h3>
                  <p className="text-xs text-gray-400">
                    Updates as you fill the form
                  </p>
                </div>
                <div className="p-4">
                  <ScoreRing score={score} />
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-600">
                        Required fields
                      </span>
                      <span className={`font-medium ${scoreTextColor}`}>
                        {completedRequired}/{totalRequired}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${scoreBarColor}`}
                        style={{
                          width: `${(completedRequired / totalRequired) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        size={12}
                        className={
                          formData.client_first_name &&
                          formData.client_last_name
                            ? "text-emerald-500"
                            : "text-gray-300"
                        }
                      />
                      <span
                        className={`text-xs ${
                          formData.client_first_name &&
                          formData.client_last_name
                            ? "text-gray-400 line-through"
                            : "text-gray-700"
                        }`}
                      >
                        Client name
                      </span>
                    </div>
                    {currentConfig.required.map((field) => (
                      <div key={field} className="flex items-center gap-2">
                        {formData.case_data[field]?.trim() ? (
                          <CheckCircle2
                            size={12}
                            className="text-emerald-500"
                          />
                        ) : (
                          <div className="w-3 h-3 rounded-full border border-gray-300" />
                        )}
                        <span
                          className={`text-xs ${
                            formData.case_data[field]?.trim()
                              ? "text-gray-400 line-through"
                              : "text-gray-700"
                          }`}
                        >
                          {formatFieldName(field)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div
                    className={`mt-4 px-3 py-2 rounded-lg text-center text-xs font-medium ${
                      score >= 80
                        ? "bg-emerald-50 text-emerald-700"
                        : score >= 50
                          ? "bg-amber-50 text-amber-700"
                          : "bg-red-50 text-red-600"
                    }`}
                  >
                    {score >= 80
                      ? "✓ Ready for consultation"
                      : score >= 50
                        ? "Almost there — keep going"
                        : "Fill required fields to continue"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
