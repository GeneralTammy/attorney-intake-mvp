"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  User,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Bell,
} from "lucide-react";

import { DesktopSidebar, MobileSidebar } from "@/components/Sidebar";

const SERIF = "'DM Serif Display', Georgia, serif";

const inputClass =
  "w-full px-4 py-3 text-base text-[#0E1320] placeholder:text-[#9AA3B5] bg-white border border-[#E0E4EE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/60 focus:border-[#3B5BDB] transition-shadow";

function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8EAF1] shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-[#EEF0F6]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#0E1320]">{title}</h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">{description}</p>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const pathname = usePathname();
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [firmName, setFirmName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [savingNotifPref, setSavingNotifPref] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        const name =
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Attorney";
        setUserName(name);
        setFirmName(user.user_metadata?.firm_name || "");
        // Stored preference; defaults to enabled when never set
        setInAppNotifications(
          user.user_metadata?.in_app_notifications !== false,
        );
      } else {
        router.push("/login");
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: userName, firm_name: firmName },
      });

      if (error) throw error;
      setSuccess("Profile updated");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);
    setError("");
    setSuccess("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      setSuccess("Password updated");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Persist the toggle to user metadata — optimistic, reverts on failure
  const handleToggleNotifications = async () => {
    const next = !inAppNotifications;
    setInAppNotifications(next);
    setSavingNotifPref(true);
    setError("");

    const { error } = await supabase.auth.updateUser({
      data: { in_app_notifications: next },
    });

    if (error) {
      setInAppNotifications(!next);
      setError("Could not save notification preference. Try again.");
    }
    setSavingNotifPref(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FB] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#64748B]">
          <div className="w-4 h-4 border-2 border-[#3B5BDB] border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FB]">
      <MobileSidebar
        userName={userName}
        onSignOut={handleSignOut}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentPath={pathname}
      />
      <DesktopSidebar
        userName={userName}
        onSignOut={handleSignOut}
        currentPath={pathname}
      />

      <div className="lg:pl-64">
        <header className="bg-white/90 backdrop-blur border-b border-[#E8EAF1] sticky top-0 z-30">
          <div className="px-5 lg:px-8 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-[#64748B] hover:bg-[#F7F8FB] rounded-lg transition"
              >
                <Menu size={20} />
              </button>
              <div>
                <h1
                  className="text-xl text-[#0E1320]"
                  style={{ fontFamily: SERIF }}
                >
                  Settings
                </h1>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Manage your account preferences
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-5 lg:px-8 py-6">
          <div className="max-w-3xl mx-auto">
            {success && (
              <div className="mb-6 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#12A06E]" />
                <p className="text-sm text-emerald-700">{success}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
                <AlertCircle size={16} className="text-[#C93B3B]" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <SectionCard
              icon={<User size={15} className="text-[#3B5BDB]" />}
              title="Profile"
              description="Your name and firm details"
            >
              <form onSubmit={handleUpdateProfile} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#334155] mb-2">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#334155] mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className={`${inputClass} bg-[#F7F8FB] text-[#94A3B8] cursor-not-allowed`}
                  />
                  <p className="text-xs text-[#94A3B8] mt-1.5">
                    Email can&rsquo;t be changed here. Contact support for
                    assistance.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#334155] mb-2">
                    Firm name
                  </label>
                  <input
                    type="text"
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    placeholder="Law Office of..."
                    className={inputClass}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#3B5BDB] hover:bg-[#2F4AC2] text-white text-sm font-medium rounded-lg transition shadow-sm disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save changes"}
                    {!saving && <Save size={14} />}
                  </button>
                </div>
              </form>
            </SectionCard>

            <SectionCard
              icon={<Shield size={15} className="text-[#3B5BDB]" />}
              title="Security"
              description="Update your password"
            >
              <form onSubmit={handleUpdatePassword} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#334155] mb-2">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className={`${inputClass} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569]"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#334155] mb-2">
                    Confirm new password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className={inputClass}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={passwordLoading || !newPassword}
                    className="px-4 py-2.5 bg-[#3B5BDB] hover:bg-[#2F4AC2] text-white text-sm font-medium rounded-lg transition shadow-sm disabled:opacity-50"
                  >
                    {passwordLoading ? "Updating..." : "Update password"}
                  </button>
                </div>
              </form>
            </SectionCard>

            <SectionCard
              icon={<Bell size={15} className="text-[#3B5BDB]" />}
              title="Notifications"
              description="How CaseReady keeps you informed"
            >
              <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-[#0E1320]">
                      In-app notifications
                    </p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      Show alerts in your dashboard when clients submit intake
                      forms
                    </p>
                  </div>
                  <button
                    onClick={handleToggleNotifications}
                    disabled={savingNotifPref}
                    aria-pressed={inAppNotifications}
                    className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 disabled:opacity-60 ${inAppNotifications ? "bg-[#3B5BDB]" : "bg-[#D7DCE7]"}`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${inAppNotifications ? "translate-x-5" : "translate-x-0.5"}`}
                    />
                  </button>
                </div>
              </div>
            </SectionCard>
          </div>
        </main>
      </div>
    </div>
  );
}
