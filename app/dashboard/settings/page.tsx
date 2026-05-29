"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Menu,
  X,
  User,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  LayoutDashboard,
  PlusCircle,
  Settings,
  Bell,
} from "lucide-react";

const B = "#3B5BDB";

function Sidebar({
  userName,
  onSignOut,
  currentPath,
}: {
  userName: string;
  onSignOut: () => void;
  currentPath: string;
}) {
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/intakes/new", label: "New Intake", icon: PlusCircle },
  ];

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-50 flex flex-col">
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
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userName}
            </p>
            <p className="text-xs text-gray-400">Solo Practitioner</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5">
        <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-3 pb-2">
          Main
        </div>
        {navItems.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-[#EEF2FF] text-[#3B5BDB] font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon
                size={16}
                className={isActive ? "text-[#3B5BDB]" : "text-gray-400"}
              />
              {item.label}
            </Link>
          );
        })}

        <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-3 pb-2 pt-6">
          Account
        </div>
        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
            currentPath === "/dashboard/settings"
              ? "bg-[#EEF2FF] text-[#3B5BDB] font-medium"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <Settings
            size={16}
            className={
              currentPath === "/dashboard/settings"
                ? "text-[#3B5BDB]"
                : "text-gray-400"
            }
          />
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
            <Settings size={16} className="text-gray-400" /> Settings
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

export default function SettingsPage() {
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

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchUserProfile();
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
      setSuccess("Profile updated successfully");
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
      setSuccess("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileSidebar
        userName={userName}
        onSignOut={handleSignOut}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <Sidebar
        userName={userName}
        onSignOut={handleSignOut}
        currentPath="/dashboard/settings"
      />

      <div className="lg:pl-64">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="px-5 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                >
                  <Menu size={20} />
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    Settings
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Manage your account preferences
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-5 lg:px-8 py-6">
          <div className="max-w-3xl mx-auto">
            {success && (
              <div className="mb-6 p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <p className="text-sm text-emerald-700">{success}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} className="text-red-500" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Profile Section */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-[#3B5BDB]" />
                  <h2 className="text-sm font-semibold text-gray-900">
                    Profile Information
                  </h2>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Update your personal information
                </p>
              </div>
              <form onSubmit={handleUpdateProfile} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3B5BDB] focus:border-[#3B5BDB] transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Email cannot be changed. Contact support for assistance.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Firm Name
                  </label>
                  <input
                    type="text"
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    placeholder="Law Office of..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3B5BDB] focus:border-[#3B5BDB] transition"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-[#3B5BDB] hover:bg-[#2F4AC2] text-white text-sm font-medium rounded-lg transition shadow-sm disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                    {!saving && <Save size={14} />}
                  </button>
                </div>
              </form>
            </div>

            {/* Password Section */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-[#3B5BDB]" />
                  <h2 className="text-sm font-semibold text-gray-900">
                    Security
                  </h2>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Update your password
                </p>
              </div>
              <form onSubmit={handleUpdatePassword} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3B5BDB] focus:border-[#3B5BDB] transition pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3B5BDB] focus:border-[#3B5BDB] transition"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={passwordLoading || !newPassword}
                    className="flex items-center gap-2 px-4 py-2 bg-[#3B5BDB] hover:bg-[#2F4AC2] text-white text-sm font-medium rounded-lg transition shadow-sm disabled:opacity-50"
                  >
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>

            {/* Notifications Section */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-[#3B5BDB]" />
                  <h2 className="text-sm font-semibold text-gray-900">
                    Notifications
                  </h2>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Manage your notification preferences
                </p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      In-app notifications
                    </p>
                    <p className="text-xs text-gray-400">
                      Receive notifications about case readiness and updates
                    </p>
                  </div>
                  <button
                    onClick={() => setInAppNotifications(!inAppNotifications)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${inAppNotifications ? "bg-[#3B5BDB]" : "bg-gray-200"}`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${inAppNotifications ? "translate-x-5" : "translate-x-0.5"}`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
