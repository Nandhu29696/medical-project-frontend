import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { Bell, Check, CheckCheck, ChevronRight } from "lucide-react";

import { NotificationIcon } from "@/components/NotificationBell";
import { EmptyState, PageHeader, Pagination, Skeleton } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthContext";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/api/notifications";
import { formatDateTime, localDateKey, timeAgo } from "@/lib/format";
import { CATEGORY_META } from "@/lib/notificationMeta";
import { ROLE_LABELS, hasAnyRole } from "@/lib/roles";
import type { AppNotification, NotificationCategory } from "@/types/notification";

const PAGE_SIZE = 20;

/** The categories each kind of user can actually receive. */
function categoriesFor(user: Parameters<typeof hasAnyRole>[0]): NotificationCategory[] {
  const set = new Set<NotificationCategory>(["ACCOUNT"]);
  if (hasAnyRole(user, ["PATIENT"])) ["CONSULTATION", "PRESCRIPTION", "DOCUMENT"].forEach((c) => set.add(c as NotificationCategory));
  if (hasAnyRole(user, ["DOCTOR"])) ["CONSULTATION", "DOCUMENT"].forEach((c) => set.add(c as NotificationCategory));
  if (hasAnyRole(user, ["SALES_MANAGER", "SALES_EXECUTIVE"])) set.add("LEAD");
  if (hasAnyRole(user, ["SUPER_ADMIN", "ADMIN"])) ["CONSULTATION", "PRESCRIPTION", "DOCUMENT", "LEAD", "SYSTEM"].forEach((c) => set.add(c as NotificationCategory));
  return (Object.keys(CATEGORY_META) as NotificationCategory[]).filter((c) => set.has(c));
}

function dayLabel(iso: string) {
  const key = localDateKey(new Date(iso));
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (key === localDateKey(today)) return "Today";
  if (key === localDateKey(yesterday)) return "Yesterday";
  return new Date(iso).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const uid = user?.id ?? "anonymous";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [category, setCategory] = useState<NotificationCategory | "">("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", uid, "page", unreadOnly, category, page],
    queryFn: () =>
      getNotifications({
        page: String(page),
        page_size: String(PAGE_SIZE),
        ...(unreadOnly ? { is_read: "false" } : {}),
        ...(category ? { category } : {}),
      }),
    enabled: !!user,
  });
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    void queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
  };
  const readOne = useMutation({ mutationFn: markNotificationRead, onSuccess: refresh });
  const readAll = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: refresh });

  if (!user) return null;
  const items = data?.results ?? [];
  const groups: { label: string; items: AppNotification[] }[] = [];
  for (const n of items) {
    const label = dayLabel(n.created_at);
    const last = groups.at(-1);
    if (last && last.label === label) last.items.push(n);
    else groups.push({ label, items: [n] });
  }

  async function open(n: AppNotification) {
    if (!n.is_read) await readOne.mutateAsync(n.id);
    if (n.link) navigate(n.link);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifications"
        subtitle={`Updates for ${user.role === "DOCTOR" ? "Dr. " : ""}${user.full_name} · ${ROLE_LABELS[user.role]}`}
        icon={Bell}
        actions={
          <button className="btn-outline" onClick={() => readAll.mutate()} disabled={readAll.isPending}>
            <CheckCheck size={16} /> Mark all read
          </button>
        }
      />

      <div className="card flex flex-wrap items-center gap-2 p-3">
        {[false, true].map((u) => (
          <button
            key={String(u)}
            onClick={() => {
              setUnreadOnly(u);
              setPage(1);
            }}
            className={unreadOnly === u ? "btn-primary btn-sm" : "btn-outline btn-sm"}
          >
            {u ? "Unread" : "All"}
          </button>
        ))}
        <span className="mx-1 h-6 w-px bg-slate-200" aria-hidden="true" />
        {(["", ...categoriesFor(user)] as (NotificationCategory | "")[]).map((c) => {
          const meta = c ? CATEGORY_META[c] : null;
          const Icon = meta?.icon;
          return (
            <button
              key={c || "all"}
              onClick={() => {
                setCategory(c);
                setPage(1);
              }}
              className={clsx(
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 transition",
                category === c ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
              )}
            >
              {Icon && <Icon size={13} />}
              {meta ? meta.label : "Every type"}
            </button>
          );
        })}
      </div>

      {isLoading && <Skeleton className="h-64 rounded-2xl" />}
      {!isLoading && items.length === 0 && (
        <div className="card">
          <EmptyState title={unreadOnly ? "No unread notifications" : "No notifications yet"} message="Updates about your account will appear here." />
        </div>
      )}

      {groups.map((group) => (
        <section key={group.label} className="space-y-2">
          <h2 className="px-1 text-xs font-bold uppercase tracking-wider text-slate-400">{group.label}</h2>
          <ul className="card divide-y divide-slate-100 overflow-hidden">
            {group.items.map((n) => (
              <li key={n.id} className={clsx("flex items-start gap-3 px-4 py-3", !n.is_read && "bg-brand-50/40")}>
                <NotificationIcon n={n} size={17} />
                <button className="min-w-0 flex-1 text-left" onClick={() => void open(n)}>
                  <p className={clsx("text-sm text-slate-800", !n.is_read ? "font-bold" : "font-medium")}>{n.title}</p>
                  {n.message && <p className="text-sm text-slate-500">{n.message}</p>}
                  <p className="mt-0.5 text-xs text-slate-400" title={formatDateTime(n.created_at)}>
                    {CATEGORY_META[n.category]?.label} · {timeAgo(n.created_at)}
                  </p>
                </button>
                <div className="flex shrink-0 items-center gap-1">
                  {!n.is_read && (
                    <button className="btn-ghost btn-sm" onClick={() => readOne.mutate(n.id)} title="Mark as read" aria-label={`Mark "${n.title}" as read`}>
                      <Check size={15} />
                    </button>
                  )}
                  {n.link && (
                    <button className="btn-ghost btn-sm" onClick={() => void open(n)} aria-label={`Open "${n.title}"`}>
                      <ChevronRight size={15} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <Pagination page={page} pageSize={PAGE_SIZE} count={data?.count ?? 0} onChange={setPage} />
    </div>
  );
}
