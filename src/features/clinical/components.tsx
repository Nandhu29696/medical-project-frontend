import { Link } from "react-router-dom";
import clsx from "clsx";
import { Building2, CalendarDays, Phone, Pill, Video } from "lucide-react";

import { formatDateTime } from "@/lib/format";
import type { ConsultationDetail, ConsultationMode, ConsultationStatus, PrescriptionItem } from "@/types/clinical";

export { Avatar } from "@/components/ui";

const STATUS_STYLES: Record<ConsultationStatus, string> = {
  SCHEDULED: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-slate-100 text-slate-500",
  NO_SHOW: "bg-amber-50 text-amber-700",
};

export function ConsultationStatusPill({ status }: { status: ConsultationStatus }) {
  return <span className={clsx("badge", STATUS_STYLES[status])}>{status.replace("_", " ")}</span>;
}

const MODE_ICONS: Record<ConsultationMode, typeof Video> = { IN_PERSON: Building2, VIDEO: Video, PHONE: Phone };
const MODE_LABELS: Record<ConsultationMode, string> = { IN_PERSON: "In person", VIDEO: "Video", PHONE: "Phone" };

export function ModeBadge({ mode, className = "text-slate-500" }: { mode: ConsultationMode; className?: string }) {
  const Icon = MODE_ICONS[mode];
  return (
    <span className={clsx("inline-flex items-center gap-1 text-xs", className)}>
      <Icon size={13} /> {MODE_LABELS[mode]}
    </span>
  );
}

export function StatCard({ label, value }: { label: string; value: number | string | undefined }) {
  return (
    <div className="card-pad">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-800">{value ?? "…"}</p>
    </div>
  );
}

export function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-800 [overflow-wrap:anywhere]">
        {value === null || value === undefined || value === "" ? "—" : value}
      </p>
    </div>
  );
}

export function PrescriptionTable({ items }: { items: PrescriptionItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-400">No medicines prescribed.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="table-base">
        <thead>
          <tr>
            <th>Medicine</th>
            <th>Dosage</th>
            <th>Frequency</th>
            <th>Duration</th>
            <th>Instructions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={item.id ?? i}>
              <td className="font-semibold text-slate-800">
                <span className="inline-flex items-center gap-2">
                  <Pill size={14} className="text-accent-600" /> {item.medicine}
                </span>
              </td>
              <td>{item.dosage || "—"}</td>
              <td>{item.frequency || "—"}</td>
              <td>{item.duration || "—"}</td>
              <td className="text-slate-500">{item.instructions || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Vertical timeline of visits, newest first. */
export function VisitTimeline({ consultations, showDoctor = true }: { consultations: ConsultationDetail[]; showDoctor?: boolean }) {
  return (
    <ol className="relative space-y-4 border-l-2 border-slate-200 pl-6">
      {consultations.map((c) => (
        <li key={c.id} className="relative">
          <span
            className={clsx(
              "absolute -left-[1.95rem] top-1 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white",
              c.status === "COMPLETED" ? "bg-emerald-500" : c.status === "SCHEDULED" ? "bg-blue-500" : "bg-slate-300"
            )}
          />
          <Link to={`/consultations/${c.id}`} className="card block p-4 transition hover:shadow-lift">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <CalendarDays size={15} className="text-slate-400" /> {formatDateTime(c.scheduled_at)}
              </p>
              <ConsultationStatusPill status={c.status} />
            </div>
            <p className="mt-1 text-sm text-slate-600">{c.chief_complaint || "Consultation"}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {showDoctor && (
                <span className="text-xs text-slate-500">
                  Dr. {c.doctor.full_name}
                  {c.doctor_specialization ? ` · ${c.doctor_specialization}` : ""}
                </span>
              )}
              <ModeBadge mode={c.mode} />
              {c.prescription_items.length > 0 && (
                <span className="badge bg-accent-50 text-accent-700">
                  <Pill size={11} /> {c.prescription_items.length} medicine{c.prescription_items.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}
