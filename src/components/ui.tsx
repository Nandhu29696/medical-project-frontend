import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { ChevronDown, ChevronLeft, ChevronRight, TrendingDown, TrendingUp, X, type LucideIcon } from "lucide-react";

import { EmptyIllustration } from "@/components/illustrations";

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <Icon size={20} />
          </span>
        )}
        <div>
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

const TONES = {
  brand: "bg-brand-50 text-brand-700",
  accent: "bg-accent-50 text-accent-700",
  blue: "bg-blue-50 text-blue-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-red-50 text-red-600",
  slate: "bg-slate-100 text-slate-600",
} as const;
export type Tone = keyof typeof TONES;

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "brand",
  hint,
  trend,
}: {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
  hint?: string;
  /** Percentage change; positive renders green/up, negative red/down. */
  trend?: number | null;
}) {
  return (
    <div className="card-pad flex items-start gap-3">
      {Icon && (
        <span className={clsx("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", TONES[tone])}>
          <Icon size={20} />
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-slate-900">{value ?? <Skeleton className="h-7 w-12" />}</p>
        <div className="mt-0.5 flex items-center gap-1 text-[11px]">
          {trend !== undefined && trend !== null && (
            <span className={clsx("flex items-center gap-0.5 font-semibold", trend >= 0 ? "text-brand-600" : "text-red-600")}>
              {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(trend)}%
            </span>
          )}
          {hint && <span className="text-slate-400">{hint}</span>}
        </div>
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <span className={clsx("block animate-pulse rounded-md bg-slate-200", className)} />;
}

export function SkeletonRows({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((__, c) => (
            <td key={c} className="px-4 py-3">
              <Skeleton className="h-4 w-full max-w-[140px]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function EmptyState({
  title,
  message,
  action,
  illustration,
}: {
  title: string;
  message?: string;
  action?: ReactNode;
  illustration?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
      <div className="mb-3 h-28 w-28">{illustration ?? <EmptyIllustration />}</div>
      <p className="font-semibold text-slate-800">{title}</p>
      {message && <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Pagination({
  page,
  pageSize,
  count,
  onChange,
}: {
  page: number;
  pageSize: number;
  count: number;
  onChange: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(count / pageSize));
  if (count === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(count, page * pageSize);
  const numbers = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - page) <= 1
  );
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
      <span>
        Showing <b className="text-slate-700">{from}</b>–<b className="text-slate-700">{to}</b> of{" "}
        <b className="text-slate-700">{count}</b>
      </span>
      <div className="flex items-center gap-1">
        <button className="btn-ghost btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
          <ChevronLeft size={14} />
        </button>
        {numbers.map((n, i) => (
          <span key={n} className="flex items-center">
            {i > 0 && numbers[i - 1] !== n - 1 && <span className="px-1">…</span>}
            <button
              onClick={() => onChange(n)}
              className={clsx(
                "h-8 min-w-8 rounded-lg px-2 text-xs font-semibold",
                n === page ? "bg-brand-600 text-white" : "hover:bg-slate-100"
              )}
            >
              {n}
            </button>
          </span>
        ))}
        <button className="btn-ghost btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page">
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string; icon?: LucideIcon; count?: number }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1" role="tablist">
      {tabs.map(({ id, label, icon: Icon, count }) => (
        <button
          key={id}
          role="tab"
          aria-selected={active === id}
          onClick={() => onChange(id)}
          className={clsx(
            "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition",
            active === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          {Icon && <Icon size={15} />}
          {label}
          {count !== undefined && (
            <span className="rounded-full bg-slate-200 px-1.5 text-[10px] text-slate-600">{count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function Accordion({ items }: { items: { question: string; answer: ReactNode }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {items.map((item, index) => (
        <div key={item.question}>
          <button
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-slate-800 hover:bg-slate-50"
            aria-expanded={open === index}
            onClick={() => setOpen(open === index ? null : index)}
          >
            {item.question}
            <ChevronDown size={18} className={clsx("shrink-0 text-slate-400 transition", open === index && "rotate-180")} />
          </button>
          {open === index && <div className="animate-fade-in px-5 pb-4 text-sm leading-relaxed text-slate-600">{item.answer}</div>}
        </div>
      ))}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  // Rendered into <body>: an animated (transformed) page wrapper would otherwise trap
  // the fixed backdrop inside the content area.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={clsx("card max-h-[90vh] w-full animate-fade-in overflow-y-auto p-5", wide ? "max-w-3xl" : "max-w-lg")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="btn-ghost btn-sm" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

const AVATAR_COLORS = [
  "bg-brand-100 text-brand-700",
  "bg-accent-100 text-accent-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-red-100 text-red-700",
];

export function Avatar({ src, name, size = 40, ring }: { src?: string | null; name: string; size?: number; ring?: boolean }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const style = { width: size, height: size };
  const ringClass = ring ? "ring-2 ring-white shadow" : "";
  if (src) {
    return <img src={src} alt={name} style={style} className={clsx("shrink-0 rounded-full object-cover", ringClass)} />;
  }
  const color = AVATAR_COLORS[name.length % AVATAR_COLORS.length];
  return (
    <div
      style={{ ...style, fontSize: Math.max(10, size / 2.8) }}
      className={clsx("flex shrink-0 items-center justify-center rounded-full font-bold", color, ringClass)}
    >
      {initials || "?"}
    </div>
  );
}

export function Badge({ children, tone = "slate" }: { children: ReactNode; tone?: Tone }) {
  return <span className={clsx("badge", TONES[tone])}>{children}</span>;
}

export function DemoNote({ children }: { children?: ReactNode }) {
  return (
    <p className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
      {children ?? "Demo content — replace with client-approved information"}
    </p>
  );
}
