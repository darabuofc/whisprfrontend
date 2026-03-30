"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  getUnreadNotificationCount,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type AppNotification,
} from "@/lib/api";

const POLL_INTERVAL = 30_000;

function NotificationAvatar({ notification }: { notification: AppNotification }) {
  const isCoupleInvite = notification.type === "couple_invite";
  const imageUrl = isCoupleInvite
    ? notification.actor_avatar_url
    : notification.organizer_logo_url;
  const name = isCoupleInvite
    ? notification.actor_name
    : notification.organizer_name;
  const initial = name?.charAt(0)?.toUpperCase() || "?";
  const bgClass = isCoupleInvite ? "bg-[#D4A574]/15" : "bg-white/[0.06]";

  return (
    <div
      className={`w-[34px] h-[34px] rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden ${bgClass}`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name || ""}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span
          className="text-[13px] font-medium"
          style={{
            color: isCoupleInvite ? "#D4A574" : "var(--text-secondary)",
          }}
        >
          {initial}
        </span>
      )}
    </div>
  );
}

export default function NotificationBell() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  // Poll unread count
  useEffect(() => {
    let active = true;

    const poll = async () => {
      try {
        const count = await getUnreadNotificationCount();
        if (active) setUnreadCount(count);
      } catch {
        // silent — polling failure shouldn't disrupt UI
      }
    };

    poll();
    const id = setInterval(poll, POLL_INTERVAL);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getNotifications();
        if (active) setNotifications(data);
      } catch {
        // silent
      } finally {
        if (active) setLoading(false);
      }
    };

    fetch();
    return () => {
      active = false;
    };
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const handleNotificationClick = useCallback(
    async (notification: AppNotification) => {
      if (!notification.is_read) {
        try {
          await markNotificationRead(notification.id);
        } catch {
          // continue to navigate even if mark-read fails
        }
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      setIsOpen(false);
      if (notification.action_url) {
        router.push(notification.action_url);
      }
    },
    [router]
  );

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
    } catch {
      return;
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, []);

  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <div ref={containerRef} className="relative">
      {/* Bell trigger */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="relative p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors duration-150"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#D4A574]" />
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-[340px] max-h-[420px] flex flex-col rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-raised)] shadow-xl shadow-black/40 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
              <span
                className="text-[13px] font-medium text-[var(--text-primary)] uppercase tracking-[0.06em]"
                style={{ fontFamily: "var(--font-body-org)" }}
              >
                Notifications
              </span>
              {hasUnread && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-[#D4A574] hover:text-[#B8785C] transition-colors duration-150 uppercase tracking-[0.06em]"
                  style={{ fontFamily: "var(--font-mono-org)" }}
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2
                    size={18}
                    className="animate-spin text-[var(--text-muted)]"
                  />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex items-center justify-center py-10">
                  <span
                    className="text-[12px] text-[var(--text-muted)]"
                    style={{ fontFamily: "var(--font-body-org)" }}
                  >
                    You&apos;re all caught up
                  </span>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-colors duration-150 hover:bg-[var(--bg-hover)] ${
                      !notification.is_read
                        ? "bg-[rgba(212,165,116,0.04)]"
                        : ""
                    }`}
                  >
                    <NotificationAvatar notification={notification} />

                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[13px] font-medium text-[var(--text-primary)] leading-tight"
                        style={{ fontFamily: "var(--font-body-org)" }}
                      >
                        {notification.title}
                      </p>
                      <p
                        className="text-[12px] text-[var(--text-muted)] leading-tight mt-0.5 truncate"
                        style={{ fontFamily: "var(--font-body-org)" }}
                      >
                        {notification.body}
                      </p>
                      <p
                        className="text-[11px] text-[var(--text-muted)] mt-1"
                        style={{ fontFamily: "var(--font-mono-org)" }}
                      >
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!notification.is_read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4A574] flex-shrink-0 mt-2" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
