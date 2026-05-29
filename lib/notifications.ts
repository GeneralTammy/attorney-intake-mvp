export interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
  type: "ready" | "missing" | "success" | "info";
  intakeId?: string;
}

// Store notifications in localStorage (persists across page reloads)
const STORAGE_KEY = "caseready_notifications";

export function getNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  return JSON.parse(stored);
}

export function saveNotifications(notifications: Notification[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

export function addNotification(
  notification: Omit<Notification, "id" | "time" | "read">,
) {
  const notifications = getNotifications();
  const newNotification: Notification = {
    ...notification,
    id: Date.now().toString(),
    time: "Just now",
    read: false,
  };
  notifications.unshift(newNotification);
  // Keep only last 50 notifications
  if (notifications.length > 50) notifications.pop();
  saveNotifications(notifications);
  return newNotification;
}

export function markAsRead(id: string) {
  const notifications = getNotifications();
  const updated = notifications.map((n) =>
    n.id === id ? { ...n, read: true } : n,
  );
  saveNotifications(updated);
}

export function markAllAsRead() {
  const notifications = getNotifications();
  const updated = notifications.map((n) => ({ ...n, read: true }));
  saveNotifications(updated);
}

export function getUnreadCount(): number {
  const notifications = getNotifications();
  return notifications.filter((n) => !n.read).length;
}

export function clearNotifications() {
  saveNotifications([]);
}
