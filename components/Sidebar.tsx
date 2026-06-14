"use client";

// components/Sidebar.tsx
// The single source of truth for app navigation.
// Every /dashboard page imports DesktopSidebar and MobileSidebar
// from here — never define a local copy.

import Link from "next/link";
import {
  Briefcase,
  X,
  LogOut,
  LayoutDashboard,
  PlusCircle,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/intakes/new", label: "New Intake", icon: PlusCircle },
];

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-[#3B5BDB] flex items-center justify-center">
        <Briefcase size={15} className="text-white" />
      </div>
      <span className="font-semibold text-base text-[#0E1320]">
        Case<span className="text-[#3B5BDB]">Ready</span>
      </span>
    </Link>
  );
}

function UserBlock({ userName }: { userName: string }) {
  return (
    <div className="px-4 py-4 border-b border-[#EEF0F6]">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center">
          <span className="text-[#3B5BDB] text-sm font-medium">
            {userName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#0E1320] truncate">
            {userName}
          </p>
        </div>
      </div>
    </div>
  );
}

function NavLinks({
  currentPath,
  onNavigate,
}: {
  currentPath: string;
  onNavigate?: () => void;
}) {
  const linkClass = (active: boolean) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
      active
        ? "bg-[#EEF2FF] text-[#3B5BDB] font-medium"
        : "text-[#475569] hover:bg-[#F7F8FB] hover:text-[#0E1320]"
    }`;

  return (
    <nav className="flex-1 px-3 py-5 space-y-0.5">
      <div className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.14em] px-3 pb-2">
        Main
      </div>
      {navItems.map((item) => {
        const isActive = currentPath === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={linkClass(isActive)}
          >
            <item.icon
              size={16}
              className={isActive ? "text-[#3B5BDB]" : "text-[#94A3B8]"}
            />{" "}
            {item.label}
          </Link>
        );
      })}
      <div className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.14em] px-3 pb-2 pt-6">
        Account
      </div>
      <Link
        href="/dashboard/settings"
        onClick={onNavigate}
        className={linkClass(currentPath === "/dashboard/settings")}
      >
        <Settings
          size={16}
          className={
            currentPath === "/dashboard/settings"
              ? "text-[#3B5BDB]"
              : "text-[#94A3B8]"
          }
        />{" "}
        Settings
      </Link>
    </nav>
  );
}

function SignOutButton({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="p-4 border-t border-[#EEF0F6]">
      <button
        onClick={onSignOut}
        className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-[#64748B] hover:bg-red-50 hover:text-[#C93B3B] transition-all"
      >
        <LogOut size={16} /> Sign out
      </button>
    </div>
  );
}

export function DesktopSidebar({
  userName,
  onSignOut,
  currentPath,
}: {
  userName: string;
  onSignOut: () => void;
  currentPath: string;
}) {
  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-white border-r border-[#E8EAF1] z-50 flex-col hidden lg:flex">
      <div className="px-5 py-5 border-b border-[#EEF0F6]">
        <Logo />
      </div>
      <UserBlock userName={userName} />
      <NavLinks currentPath={currentPath} />
      <SignOutButton onSignOut={onSignOut} />
    </aside>
  );
}

export function MobileSidebar({
  userName,
  onSignOut,
  isOpen,
  onClose,
  currentPath,
}: {
  userName: string;
  onSignOut: () => void;
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
}) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      <aside className="fixed top-0 left-0 h-full w-72 bg-white z-50 flex flex-col shadow-xl lg:hidden">
        <div className="px-5 py-5 border-b border-[#EEF0F6] flex justify-between items-center">
          <Logo />
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-[#F7F8FB] transition"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <UserBlock userName={userName} />
        <NavLinks currentPath={currentPath} onNavigate={onClose} />
        <SignOutButton
          onSignOut={() => {
            onSignOut();
            onClose();
          }}
        />
      </aside>
    </>
  );
}
