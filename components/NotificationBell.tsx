"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface DbNotification {
  id: string;
  intake_id: string | null;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const supabase = createClient();

  // Respect the in-app notifications preference from Settings
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEnabled(data.user?.user_metadata?.in_app_notifications !== false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNotifications = useCallback(async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("id, intake_id, message, type, read, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setNotifications(data);
    }
  }, [supabase]);

  useEffect(() => {
    if (!enabled) return;
    fetchNotifications();
    // Light polling so new submissions appear without a refresh
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [fetchNotifications, enabled]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!enabled) return null;

  const handleOpen = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) fetchNotifications();
  };

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("read", false);
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition"
        aria-label="Notifications"
      >
        <Bell size={14} className="text-gray-500" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-medium flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-gray-100 shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-[#3B5BDB] hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No notifications</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleMarkAsRead(notif.id)}
                    className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                      !notif.read ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 ${
                          notif.type === "ready"
                            ? "bg-emerald-500"
                            : notif.type === "missing"
                              ? "bg-amber-500"
                              : notif.type === "success"
                                ? "bg-blue-500"
                                : "bg-gray-400"
                        }`}
                      />
                      <div className="flex-1">
                        <p
                          className={`text-sm ${
                            !notif.read
                              ? "font-medium text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {timeAgo(notif.created_at)}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#3B5BDB] mt-1.5" />
                      )}
                    </div>
                    {notif.intake_id && (
                      <Link
                        href={`/dashboard/intakes/${notif.intake_id}`}
                        className="text-xs text-[#3B5BDB] mt-2 inline-block hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View case →
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
