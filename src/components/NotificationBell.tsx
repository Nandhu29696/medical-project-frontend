import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import {
  Bell,
  BellRing,
  CalendarCheck,
  CheckCheck,
  FileText,
  Info,
  Monitor,
  Pill,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { getNotifications, getUnreadCount, markAllNotificationsRead, markNotificationRead } from "@/lib/api/notifications";
import { timeAgo } from "@/lib/format";
import {
  desktopPermission,
  enableDesktopPopups,
  getPopupPrefs,
  onPopupPrefsChange,
  setPopupPrefs,
  type PopupPrefs,
} from "@/lib/popupPrefs";
import type { AppNotification, NotificationCategory } from "@/types/notification";

const ICONS: Record<NotificationCategory, typeof Bell> = {
  LEAD: Users,
  CONSULTATION: CalendarCheck,
  PRESCRIPTION: Pill,
  DOCUMENT: FileText,
  ACCOUNT: UserRound,
  SYSTEM: Info,
};

const POLL_MS = 30_000;
const POPUP_MS = 7_000;

function Switch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={clsx("relative h-5 w-9 shrink-0 rounded-full transition", checked ? "bg-brand-600" : "bg-slate-300")}
    >
      <span className={clsx("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition", checked ? "left-[18px]" : "left-0.5")} />
    </button>
  );
}

/** Pop-up cards for notifications that arrive while the app is open. */
function Popups({ items, onOpen, onClose }: { items: AppNotification[]; onOpen: (n: AppNotification) => void; onClose: (id: string) => void }) {
  return (
    <div className="no-print pointer-events-none fixed right-4 top-16 z-[90] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2" aria-live="polite">
      {items.map((n) => {
        const Icon = ICONS[n.category] ?? Info;
        return (
          <div key={n.id} role="status" className="pointer-events-auto flex animate-fade-in gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-lift">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Icon size={18} />
            </span>
            <button className="min-w-0 flex-1 text-left" onClick={() => onOpen(n)}>
              <span className="block text-sm font-bold text-slate-800">{n.title}</span>
              {n.message && <span className="block truncate text-xs text-slate-500">{n.message}</span>}
              {n.link && <span className="text-[11px] font-semibold text-brand-600">View</span>}
            </button>
            <button onClick={() => onClose(n.id)} className="self-start text-slate-400 hover:text-slate-600" aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [popups, setPopups] = useState<AppNotification[]>([]);
  const [prefs, setPrefs] = useState<PopupPrefs>(getPopupPrefs);
  const [permission, setPermission] = useState(desktopPermission);
  const ref = useRef<HTMLDivElement>(null);
  // Notifications already known when the app loaded never pop up.
  const seen = useRef<Set<string> | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const list = useQuery({ queryKey: ["notifications"], queryFn: getNotifications, refetchInterval: POLL_MS });
  const unreadCount = useQuery({ queryKey: ["notifications-unread"], queryFn: getUnreadCount, refetchInterval: POLL_MS });
  const unread = unreadCount.data ?? 0;

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    void queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
  }, [queryClient]);
  const readAll = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: refresh });

  useEffect(() => onPopupPrefsChange(setPrefs), []);

  const openNotification = useCallback(
    async (n: AppNotification) => {
      setPopups((all) => all.filter((p) => p.id !== n.id));
      setOpen(false);
      if (!n.is_read) {
        await markNotificationRead(n.id);
        refresh();
      }
      if (n.link) navigate(n.link);
    },
    [navigate, refresh]
  );

  // Detect newly arrived notifications and raise pop-ups.
  useEffect(() => {
    const results = list.data?.results;
    if (!results) return;
    if (seen.current === null) {
      seen.current = new Set(results.map((n) => n.id));
      return;
    }
    const fresh = results.filter((n) => !n.is_read && !seen.current!.has(n.id));
    fresh.forEach((n) => seen.current!.add(n.id));
    if (!fresh.length) return;

    if (prefs.inApp) {
      setPopups((all) => [...fresh, ...all].slice(0, 3));
      fresh.forEach((n) => window.setTimeout(() => setPopups((all) => all.filter((p) => p.id !== n.id)), POPUP_MS));
    }
    if (prefs.desktop && desktopPermission() === "granted") {
      fresh.slice(0, 3).forEach((n) => {
        const desktop = new Notification(n.title, { body: n.message, icon: "/favicon.svg", tag: n.id });
        desktop.onclick = () => {
          window.focus();
          void openNotification(n);
          desktop.close();
        };
      });
    }
  }, [list.data, prefs, openNotification]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function toggleDesktop() {
    if (prefs.desktop) {
      setPopupPrefs({ desktop: false });
      return;
    }
    setPermission(await enableDesktopPopups());
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn-ghost relative h-9 w-9 !px-0"
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
      >
        {unread > 0 ? <BellRing size={18} className="text-brand-700" /> : <Bell size={18} />}
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="card absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] animate-fade-in overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-bold text-slate-800">Notifications</p>
            <button className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline" onClick={() => readAll.mutate()}>
              <CheckCheck size={14} /> Mark all read
            </button>
          </div>
          <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
            {list.isLoading && <li className="p-4 text-sm text-slate-400">Loading…</li>}
            {list.data?.results.length === 0 && <li className="p-6 text-center text-sm text-slate-400">You're all caught up.</li>}
            {list.data?.results.map((n) => {
              const Icon = ICONS[n.category] ?? Info;
              return (
                <li key={n.id}>
                  <button
                    onClick={() => void openNotification(n)}
                    className={clsx("flex w-full gap-3 px-4 py-3 text-left hover:bg-slate-50", !n.is_read && "bg-brand-50/50")}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <Icon size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-800">{n.title}</span>
                      {n.message && <span className="block truncate text-xs text-slate-500">{n.message}</span>}
                      <span className="text-[11px] text-slate-400">{timeAgo(n.created_at)}</span>
                    </span>
                    {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="space-y-2 border-t border-slate-100 bg-slate-50/80 px-4 py-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 font-semibold text-slate-600"><BellRing size={13} /> Pop-up alerts</span>
              <Switch checked={prefs.inApp} onChange={() => setPopupPrefs({ inApp: !prefs.inApp })} label="Pop-up alerts" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 font-semibold text-slate-600"><Monitor size={13} /> Desktop notifications</span>
              {permission === "unsupported" ? (
                <span className="text-slate-400">Not supported</span>
              ) : permission === "denied" ? (
                <span className="text-slate-400" title="Allow notifications for this site in your browser settings">Blocked in browser</span>
              ) : (
                <Switch checked={prefs.desktop && permission === "granted"} onChange={() => void toggleDesktop()} label="Desktop notifications" />
              )}
            </div>
          </div>
        </div>
      )}
      <Popups items={popups} onOpen={(n) => void openNotification(n)} onClose={(id) => setPopups((all) => all.filter((p) => p.id !== id))} />
    </div>
  );
}
