"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
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
} from "lucide-react";

const B = "#3B5BDB";
const BH = "#2F4AC2";
const BT = "#EEF2FF";

// ─── Case Type Configurations (same as before) ─────────────
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
    <div className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto">
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
        <span
          className="text-3xl sm:text-4xl font-bold leading-none"
          style={{ color }}
        >
          {score}%
        </span>
        <span className="text-[10px] sm:text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">
          Ready
        </span>
      </div>
    </div>
  );
}

// ─── Mobile Sidebar Component ──────────────────────────────
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

  const handleLinkClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      <aside className="fixed top-0 left-0 h-full w-64 bg-white z-50 flex flex-col shadow-xl lg:hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3B5BDB] flex items-center justify-center">
              <Briefcase size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">
              Case<span className="text-[#3B5BDB]">Ready</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#EEF2FF] flex items-center justify-center">
              <span className="text-[#3B5BDB] text-sm font-semibold">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{userName}</p>
              <p className="text-xs text-gray-400">Solo Practitioner</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                item.href === "/dashboard/intakes/new"
                  ? "bg-[#EEF2FF] text-[#3B5BDB]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon
                size={18}
                className={
                  item.href === "/dashboard/intakes/new"
                    ? "text-[#3B5BDB]"
                    : "text-gray-400"
                }
              />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => {
              onSignOut();
              onClose();
            }}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Desktop Sidebar ──────────────────────────────────────
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
      <div className="px-6 py-5 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#3B5BDB] flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
            <Briefcase size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900 tracking-tight">
            Case<span className="text-[#3B5BDB]">Ready</span>
          </span>
        </Link>
      </div>

      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#EEF2FF] flex items-center justify-center">
            <span className="text-[#3B5BDB] text-sm font-semibold">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{userName}</p>
            <p className="text-xs text-gray-400">Solo Practitioner</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              item.href === "/dashboard/intakes/new"
                ? "bg-[#EEF2FF] text-[#3B5BDB]"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <item.icon
              size={18}
              className={
                item.href === "/dashboard/intakes/new"
                  ? "text-[#3B5BDB]"
                  : "text-gray-400"
              }
            />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={18} />
          Sign out
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
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
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
  const requiredFields = currentConfig.required;

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

  const missingRequired = requiredFields.filter(
    (field) => !formData.case_data[field]?.trim(),
  );

  const isClientInfoValid =
    formData.client_first_name.trim() !== "" &&
    formData.client_last_name.trim() !== "";

  const isFormValid = isClientInfoValid && missingRequired.length === 0;

  const handleCaseTypeChange = (caseType: string) => {
    setFormData({ ...formData, case_type: caseType, case_data: {} });
    setTouchedFields(new Set());
    setShowValidation(false);
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      case_data: { ...formData.case_data, [field]: value },
    });
  };

  const handleBlur = (field: string) => {
    setTouchedFields((prev) => new Set(prev).add(field));
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
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
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

      const reportResponse = await fetch(
        `/api/intakes/${intake.id}/readiness`,
        {
          method: "POST",
        },
      );

      if (!reportResponse.ok) {
        router.push(`/dashboard/intakes/${intake.id}`);
        return;
      }

      router.push(`/dashboard/intakes/${intake.id}/readiness`);
    } catch (err) {
      console.error("Submit error:", err);
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
        {/* Top Bar - Responsive */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                >
                  <Menu size={20} />
                </button>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                    New Client Intake
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                    Collect client information and case details
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition group text-sm"
              >
                <ArrowLeft
                  size={16}
                  className="group-hover:-translate-x-0.5 transition"
                />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Link>
            </div>
            <p className="text-xs text-gray-500 mt-2 sm:hidden">
              Collect client information and case details
            </p>
          </div>
        </header>

        {/* Main Content - Responsive */}
        <main className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* LEFT: Form */}
            <div className="flex-1 min-w-0">
              {/* Error Alert */}
              {error && (
                <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                  <AlertCircle
                    size={16}
                    className="text-red-500 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="font-semibold text-red-800 text-xs sm:text-sm">
                      Error creating intake
                    </p>
                    <p className="text-red-600 text-xs sm:text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Incomplete warning */}
              {showValidation && !isFormValid && (
                <div className="mb-4 sm:mb-6 bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                  <AlertTriangle
                    size={16}
                    className="text-amber-500 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="font-semibold text-amber-800 text-xs sm:text-sm">
                      Incomplete Form
                    </p>
                    <p className="text-amber-700 text-xs sm:text-sm">
                      Please complete all required fields before submitting.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Client Information Section */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-[#3B5BDB]" />
                      <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                        Client Information
                      </h2>
                      <span className="ml-2 text-[10px] sm:text-xs text-red-500">
                        * Required
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Basic details about the client
                    </p>
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      {/* First Name */}
                      <div
                        className={
                          showValidation && !formData.client_first_name
                            ? "error-field"
                            : ""
                        }
                      >
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
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
                          onBlur={() => handleBlur("client_first_name")}
                          placeholder="John"
                          className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:border-transparent transition bg-white ${
                            showValidation && !formData.client_first_name
                              ? "border-red-300 bg-red-50/50"
                              : "border-gray-200"
                          }`}
                        />
                        {showValidation && !formData.client_first_name && (
                          <p className="text-[10px] sm:text-xs text-red-500 mt-1">
                            First name is required
                          </p>
                        )}
                      </div>

                      {/* Last Name */}
                      <div
                        className={
                          showValidation && !formData.client_last_name
                            ? "error-field"
                            : ""
                        }
                      >
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
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
                          onBlur={() => handleBlur("client_last_name")}
                          placeholder="Doe"
                          className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:border-transparent transition bg-white ${
                            showValidation && !formData.client_last_name
                              ? "border-red-300 bg-red-50/50"
                              : "border-gray-200"
                          }`}
                        />
                        {showValidation && !formData.client_last_name && (
                          <p className="text-[10px] sm:text-xs text-red-500 mt-1">
                            Last name is required
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                          <Mail size={14} className="inline mr-1" /> Email
                          Address
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
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:border-transparent transition bg-white"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                          <Phone size={14} className="inline mr-1" /> Phone
                          Number
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
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:border-transparent transition bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Case Details Section */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} className="text-[#3B5BDB]" />
                      <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                        Case Details
                      </h2>
                      <span className="ml-2 text-[10px] sm:text-xs text-red-500">
                        * Required
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Select case type and provide relevant information
                    </p>
                  </div>

                  <div className="p-4 sm:p-6">
                    {/* Case Type Select */}
                    <div className="mb-6 sm:mb-8">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                        Case Type <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={formData.case_type}
                          onChange={(e) => handleCaseTypeChange(e.target.value)}
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:border-transparent appearance-none bg-white cursor-pointer"
                        >
                          {Object.entries(caseTypeConfigs).map(
                            ([value, config]) => (
                              <option key={value} value={value}>
                                {config.label}
                              </option>
                            ),
                          )}
                        </select>
                        <ChevronDown
                          size={16}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {currentConfig.icon}
                        <p className="text-xs text-gray-500">
                          {currentConfig.description}
                        </p>
                      </div>
                    </div>

                    {/* Required Fields */}
                    <div className="mb-6 sm:mb-8">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-5 sm:h-6 bg-red-500 rounded-full" />
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                            Required Information
                          </h3>
                        </div>
                        <span className="text-xs text-gray-400">
                          {
                            currentConfig.required.filter((k) =>
                              formData.case_data[k]?.trim(),
                            ).length
                          }{" "}
                          / {currentConfig.required.length} complete
                        </span>
                      </div>
                      <div className="space-y-4 sm:space-y-5">
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
                              <label className="flex flex-wrap items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                                <span className="capitalize">
                                  {formatFieldName(field)}
                                </span>
                                <span className="text-red-500">*</span>
                                {isFilled && !isError && (
                                  <CheckCircle2
                                    size={14}
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
                                  onBlur={() => handleBlur(field)}
                                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:border-transparent transition bg-white ${
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
                                  onBlur={() => handleBlur(field)}
                                  placeholder={placeholder}
                                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:border-transparent transition bg-white ${
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
                                  onBlur={() => handleBlur(field)}
                                  placeholder={placeholder}
                                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:border-transparent transition resize-none bg-white ${
                                    isError
                                      ? "border-red-300 bg-red-50/50"
                                      : "border-gray-200"
                                  }`}
                                />
                              )}
                              {isError && (
                                <p className="text-[10px] sm:text-xs text-red-500 mt-1">
                                  {formatFieldName(field)} is required
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Optional Fields */}
                    {currentConfig.optional.length > 0 && (
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <div className="w-1 h-5 sm:h-6 bg-gray-400 rounded-full" />
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                            Optional Information
                          </h3>
                          <span className="text-[10px] sm:text-xs text-gray-400">
                            (Helpful but not required)
                          </span>
                        </div>
                        <div className="space-y-4 sm:space-y-5">
                          {currentConfig.optional.map((field) => {
                            const fieldType =
                              currentConfig.fieldTypes[field] ?? "textarea";
                            const placeholder =
                              currentConfig.fieldPlaceholders[field] ??
                              `Optional: ${formatFieldName(field).toLowerCase()}...`;
                            return (
                              <div key={field}>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                                  {formatFieldName(field)}
                                </label>
                                {fieldType === "date" ? (
                                  <input
                                    type="date"
                                    value={formData.case_data[field] || ""}
                                    onChange={(e) =>
                                      handleFieldChange(field, e.target.value)
                                    }
                                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:border-transparent transition bg-white"
                                  />
                                ) : fieldType === "text" ? (
                                  <input
                                    type="text"
                                    value={formData.case_data[field] || ""}
                                    onChange={(e) =>
                                      handleFieldChange(field, e.target.value)
                                    }
                                    placeholder={placeholder}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:border-transparent transition bg-white"
                                  />
                                ) : (
                                  <textarea
                                    rows={2}
                                    value={formData.case_data[field] || ""}
                                    onChange={(e) =>
                                      handleFieldChange(field, e.target.value)
                                    }
                                    placeholder={placeholder}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:border-transparent transition resize-none bg-white"
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

                {/* Form Actions - Responsive */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 pb-10">
                  <Link
                    href="/dashboard"
                    className="order-2 sm:order-1 px-4 sm:px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition text-center"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="order-1 sm:order-2 px-4 sm:px-6 py-2.5 bg-[#3B5BDB] hover:bg-[#2F4AC2] text-white font-semibold rounded-xl transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Create Intake
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* RIGHT: Live Readiness Panel - Hidden on mobile, shows on tablet and desktop */}
            <div className="hidden md:block lg:w-72 flex-shrink-0 sticky top-24">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">
                    Readiness Score
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                    Updates as you fill the form
                  </p>
                </div>
                <div className="p-4 sm:p-5">
                  <ScoreRing score={score} />

                  <div className="mt-4 sm:mt-5">
                    <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                      <span className="font-semibold text-gray-600">
                        Required fields
                      </span>
                      <span className={`font-bold ${scoreTextColor}`}>
                        {completedRequired}/{totalRequired}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${scoreBarColor}`}
                        style={{
                          width: `${(completedRequired / totalRequired) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      {formData.client_first_name &&
                      formData.client_last_name ? (
                        <CheckCircle2
                          size={14}
                          className="text-emerald-500 flex-shrink-0"
                        />
                      ) : (
                        <AlertCircle
                          size={14}
                          className="text-red-400 flex-shrink-0"
                        />
                      )}
                      <span
                        className={`text-xs truncate ${
                          formData.client_first_name &&
                          formData.client_last_name
                            ? "text-gray-400 line-through"
                            : "text-gray-700 font-medium"
                        }`}
                      >
                        Client name
                      </span>
                    </div>
                    {currentConfig.required.map((field) => {
                      const filled = !!formData.case_data[field]?.trim();
                      return (
                        <div key={field} className="flex items-center gap-2.5">
                          {filled ? (
                            <CheckCircle2
                              size={14}
                              className="text-emerald-500 flex-shrink-0"
                            />
                          ) : (
                            <AlertCircle
                              size={14}
                              className="text-red-400 flex-shrink-0"
                            />
                          )}
                          <span
                            className={`text-xs truncate ${
                              filled
                                ? "text-gray-400 line-through"
                                : "text-gray-700 font-medium"
                            }`}
                          >
                            {formatFieldName(field)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    className={`mt-4 sm:mt-5 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-center text-xs sm:text-sm font-bold ${
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
