import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ChevronRight, XCircle } from "lucide-react";

import { useToast } from "@/components/Toast";
import { Avatar, EmptyState, SkeletonRows } from "@/components/ui";
import { CalendarIllustration } from "@/components/illustrations";
import { updateConsultation } from "@/lib/api/clinical";
import { ConsultationStatusPill, ModeBadge } from "@/features/clinical/components";
import { formatDateTime } from "@/lib/format";
import type { Consultation } from "@/types/clinical";

interface Props {
  consultations: Consultation[] | undefined;
  isLoading: boolean;
  /** Show Complete / Cancel buttons (clinical staff only). */
  canManage: boolean;
  showPatient?: boolean;
  showDoctor?: boolean;
}

export default function ConsultationTable({ consultations, isLoading, canManage, showPatient = true, showDoctor = true }: Props) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Consultation["status"] }) => updateConsultation(id, { status }),
    onSuccess: (_, { status }) => {
      void queryClient.invalidateQueries({ queryKey: ["consultations"] });
      void queryClient.invalidateQueries({ queryKey: ["clinical-summary"] });
      toast(status === "COMPLETED" ? "Consultation completed." : "Consultation cancelled.");
    },
  });

  const columns = 5 + Number(showPatient) + Number(showDoctor);

  if (!isLoading && consultations?.length === 0) {
    return (
      <div className="card">
        <EmptyState title="No consultations" message="Scheduled and past visits will appear here." illustration={<CalendarIllustration />} />
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="table-base">
        <thead>
          <tr>
            <th>When</th>
            {showPatient && <th>Patient</th>}
            {showDoctor && <th>Doctor</th>}
            <th>Mode</th>
            <th>Reason</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && <SkeletonRows cols={columns} />}
          {consultations?.map((c) => (
            <tr key={c.id} className="align-middle">
              <td className="whitespace-nowrap font-medium text-slate-700">{formatDateTime(c.scheduled_at)}</td>
              {showPatient && (
                <td>
                  <span className="flex items-center gap-2">
                    <Avatar name={c.patient.full_name} size={28} /> {c.patient.full_name}
                  </span>
                </td>
              )}
              {showDoctor && <td>Dr. {c.doctor.full_name}</td>}
              <td><ModeBadge mode={c.mode} /></td>
              <td className="max-w-xs truncate text-slate-600">{c.chief_complaint || "—"}</td>
              <td><ConsultationStatusPill status={c.status} /></td>
              <td className="whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-1">
                  {canManage && c.status === "SCHEDULED" && (
                    <>
                      <button className="btn-ghost btn-sm text-brand-700" title="Mark completed" onClick={() => mutation.mutate({ id: c.id, status: "COMPLETED" })}>
                        <CheckCircle2 size={15} />
                      </button>
                      <button className="btn-ghost btn-sm text-slate-500" title="Cancel" onClick={() => mutation.mutate({ id: c.id, status: "CANCELLED" })}>
                        <XCircle size={15} />
                      </button>
                    </>
                  )}
                  <Link to={`/consultations/${c.id}`} className="btn-outline btn-sm">
                    Open <ChevronRight size={13} />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
