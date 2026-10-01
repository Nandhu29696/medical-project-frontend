import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardPen,
  Pill,
  Plus,
  Printer,
  Save,
  Stethoscope,
  Trash2,
  UserRound,
} from "lucide-react";

import { useToast } from "@/components/Toast";
import { Avatar, EmptyState, Skeleton } from "@/components/ui";
import { Logo } from "@/layouts/PublicLayout";
import { useAuth } from "@/features/auth/AuthContext";
import { ConsultationStatusPill, Field, ModeBadge, PrescriptionTable } from "@/features/clinical/components";
import { getConsultation, savePrescription, updateConsultation } from "@/lib/api/clinical";
import { formatDate, formatDateTime } from "@/lib/format";
import { ADMIN_ROLES, hasAnyRole } from "@/lib/roles";
import type { ConsultationDetail, PrescriptionItem } from "@/types/clinical";

const EMPTY_ITEM: PrescriptionItem = { medicine: "", dosage: "", frequency: "", duration: "", instructions: "" };

function NotesEditor({ consultation }: { consultation: ConsultationDetail }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState({
    status: consultation.status,
    clinical_notes: consultation.clinical_notes,
    recommendations: consultation.recommendations,
    follow_up_date: consultation.follow_up_date ?? "",
  });
  const mutation = useMutation({
    mutationFn: () => updateConsultation(consultation.id, { ...form, follow_up_date: form.follow_up_date || null }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["consultation", consultation.id], updated);
      void queryClient.invalidateQueries({ queryKey: ["consultations"] });
      toast("Consultation notes saved.");
    },
    onError: () => toast("Could not save notes.", "error"),
  });

  return (
    <div className="card-pad space-y-3">
      <p className="section-title flex items-center gap-2"><ClipboardPen size={16} className="text-brand-600" /> Clinical notes</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <span className="label">Status</span>
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ConsultationDetail["status"] })}>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No show</option>
          </select>
        </label>
        <label>
          <span className="label">Follow-up date</span>
          <input type="date" className="input" value={form.follow_up_date} onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })} />
        </label>
      </div>
      <label className="block">
        <span className="label">Notes</span>
        <textarea rows={4} className="input" value={form.clinical_notes} onChange={(e) => setForm({ ...form, clinical_notes: e.target.value })} />
      </label>
      <label className="block">
        <span className="label">Recommendations</span>
        <textarea rows={2} className="input" value={form.recommendations} onChange={(e) => setForm({ ...form, recommendations: e.target.value })} />
      </label>
      <button className="btn-primary" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
        <Save size={16} /> Save notes
      </button>
    </div>
  );
}

function PrescriptionEditor({ consultation }: { consultation: ConsultationDetail }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [items, setItems] = useState<PrescriptionItem[]>(
    consultation.prescription_items.length ? consultation.prescription_items : [{ ...EMPTY_ITEM }]
  );
  const mutation = useMutation({
    mutationFn: () => savePrescription(consultation.id, items.filter((i) => i.medicine.trim())),
    onSuccess: (updated) => {
      queryClient.setQueryData(["consultation", consultation.id], updated);
      toast("Prescription saved — the patient has been notified.");
    },
    onError: () => toast("Could not save the prescription.", "error"),
  });
  const update = (index: number, key: keyof PrescriptionItem, value: string) =>
    setItems(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));

  return (
    <div className="card-pad space-y-3">
      <p className="section-title flex items-center gap-2"><Pill size={16} className="text-accent-600" /> Prescription</p>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="grid gap-2 rounded-xl bg-slate-50 p-3 sm:grid-cols-[2fr_1fr_1fr_1fr_1.5fr_auto]">
            <input className="input" placeholder="Medicine" value={item.medicine} onChange={(e) => update(index, "medicine", e.target.value)} />
            <input className="input" placeholder="Dosage" value={item.dosage} onChange={(e) => update(index, "dosage", e.target.value)} />
            <input className="input" placeholder="Frequency" value={item.frequency} onChange={(e) => update(index, "frequency", e.target.value)} />
            <input className="input" placeholder="Duration" value={item.duration} onChange={(e) => update(index, "duration", e.target.value)} />
            <input className="input" placeholder="Instructions" value={item.instructions} onChange={(e) => update(index, "instructions", e.target.value)} />
            <button className="btn-ghost btn-sm text-red-600" aria-label="Remove medicine" onClick={() => setItems(items.filter((_, i) => i !== index))}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button className="btn-outline btn-sm" onClick={() => setItems([...items, { ...EMPTY_ITEM }])}>
          <Plus size={14} /> Add medicine
        </button>
        <button className="btn-primary btn-sm" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
          <Save size={14} /> Save prescription
        </button>
      </div>
    </div>
  );
}

export default function ConsultationDetailPage() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const { data: c, isLoading, isError } = useQuery({ queryKey: ["consultation", id], queryFn: () => getConsultation(id) });

  if (isLoading) return <Skeleton className="h-96 rounded-2xl" />;
  if (isError || !c) {
    return <EmptyState title="Consultation not found" action={<Link to="/consultations" className="btn-outline">Back</Link>} />;
  }

  const canEdit = hasAnyRole(user, ADMIN_ROLES) || c.doctor.id === user?.id;

  return (
    <div className="space-y-5">
      <div className="no-print flex flex-wrap items-center justify-between gap-2">
        <Link to="/consultations" className="btn-ghost btn-sm"><ArrowLeft size={14} /> Consultations</Link>
        <button className="btn-outline btn-sm" onClick={() => window.print()}>
          <Printer size={14} /> Print / Save as PDF
        </button>
      </div>

      {/* Printable visit summary */}
      <div className="card print-sheet overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-brand-50 to-accent-50 px-6 py-4">
          <Logo />
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-slate-400">Visit summary</p>
            <p className="font-mono text-xs text-slate-500">#{c.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
        <div className="grid gap-6 p-6 md:grid-cols-3">
          <div className="flex items-center gap-3">
            <Avatar name={c.patient.full_name} size={48} />
            <div>
              <p className="flex items-center gap-1 text-xs text-slate-400"><UserRound size={12} /> Patient</p>
              <p className="font-bold text-slate-800">{c.patient.full_name}</p>
              <p className="text-xs text-slate-500">{c.patient_code ?? c.patient.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Avatar name={c.doctor.full_name} size={48} />
            <div>
              <p className="flex items-center gap-1 text-xs text-slate-400"><Stethoscope size={12} /> Doctor</p>
              <p className="font-bold text-slate-800">Dr. {c.doctor.full_name}</p>
              <p className="text-xs text-slate-500">{c.doctor_specialization}</p>
            </div>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs text-slate-400"><CalendarDays size={12} /> When</p>
            <p className="font-bold text-slate-800">{formatDateTime(c.scheduled_at)}</p>
            <div className="mt-1 flex items-center gap-2">
              <ModeBadge mode={c.mode} />
              <ConsultationStatusPill status={c.status} />
            </div>
          </div>
        </div>
        <div className="grid gap-6 border-t border-slate-100 p-6 md:grid-cols-2">
          <Field label="Reason for visit" value={c.chief_complaint} />
          <Field label="Follow-up" value={c.follow_up_date ? formatDate(c.follow_up_date) : null} />
          <Field label="Clinical notes" value={c.clinical_notes} />
          <Field label="Recommendations" value={c.recommendations} />
        </div>
        <div className="border-t border-slate-100 p-6">
          <p className="section-title mb-3 flex items-center gap-2"><Pill size={16} className="text-accent-600" /> Prescription</p>
          <PrescriptionTable items={c.prescription_items} />
        </div>
        <p className="border-t border-slate-100 px-6 py-3 text-[11px] text-slate-400">
          Demo system — not a valid medical prescription. Generated {new Date().toLocaleString()}.
        </p>
      </div>

      {canEdit && (
        <div className="no-print grid gap-5 xl:grid-cols-2">
          <NotesEditor key={`notes-${c.updated_at}`} consultation={c} />
          <PrescriptionEditor key={`rx-${c.updated_at}`} consultation={c} />
        </div>
      )}
    </div>
  );
}
