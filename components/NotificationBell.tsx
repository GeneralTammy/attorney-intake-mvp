"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  Notification,
} from "@/lib/notifications";
import Link from "next/link";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = getUnreadCount();

  useEffect(() => {
    setNotifications(getNotifications());

    // Listen for storage events (notifications from other tabs)
    const handleStorageChange = () => {
      setNotifications(getNotifications());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
    setNotifications(getNotifications());
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    setNotifications(getNotifications());
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition"
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
                          className={`text-sm ${!notif.read ? "font-medium text-gray-900" : "text-gray-700"}`}
                        >
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notif.time}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#3B5BDB] mt-1.5" />
                      )}
                    </div>
                    {notif.intakeId && (
                      <Link
                        href={`/dashboard/intakes/${notif.intakeId}`}
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
