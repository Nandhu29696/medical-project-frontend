import { useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  CalendarPlus,
  Camera,
  Droplets,
  FileText,
  History,
  Mail,
  Pencil,
  Phone,
  ShieldAlert,
  Stethoscope,
  UserRound,
} from "lucide-react";

import { useToast } from "@/components/Toast";
import { Avatar, Badge, EmptyState, Modal, Skeleton, Tabs } from "@/components/ui";
import { CalendarIllustration } from "@/components/illustrations";
import { useAuth } from "@/features/auth/AuthContext";
import DocumentsPanel from "@/features/clinical/DocumentsPanel";
import VitalsPanel from "@/features/clinical/VitalsPanel";
import { Field, VisitTimeline } from "@/features/clinical/components";
import {
  createConsultation,
  getConsultations,
  getDoctors,
  getPatient,
  updatePatientClinical,
  uploadPatientPhoto,
} from "@/lib/api/clinical";
import { formatDate } from "@/lib/format";
import { ADMIN_ROLES, CLINICAL_STAFF_ROLES, hasAnyRole } from "@/lib/roles";
import type { Patient } from "@/types/clinical";

type Tab = "overview" | "visits" | "vitals" | "documents";

function ClinicalInfo({ patient, canEdit }: { patient: Patient; canEdit: boolean }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    medical_history: patient.medical_history,
    allergies: patient.allergies,
    current_medications: patient.current_medications,
  });
  const mutation = useMutation({
    mutationFn: () => updatePatientClinical(patient.id, form),
    onSuccess: (updated) => {
      queryClient.setQueryData(["patient", patient.id], updated);
      setEditing(false);
      toast("Clinical information saved.");
    },
    onError: () => toast("Could not save changes.", "error"),
  });

  const fields: { key: keyof typeof form; label: string; icon: typeof ShieldAlert }[] = [
    { key: "medical_history", label: "Medical history", icon: History },
    { key: "allergies", label: "Allergies", icon: ShieldAlert },
    { key: "current_medications", label: "Current medications", icon: Activity },
  ];

  return (
    <div className="card-pad">
      <div className="mb-4 flex items-center justify-between">
        <p className="section-title">Clinical information</p>
        {canEdit && !editing && (
          <button className="btn-ghost btn-sm" onClick={() => setEditing(true)}><Pencil size={13} /> Edit</button>
        )}
      </div>
      {editing ? (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          {fields.map(({ key, label }) => (
            <label key={key} className="block">
              <span className="label">{label}</span>
              <textarea rows={2} className="input" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
            </label>
          ))}
          <div className="flex gap-2">
            <button type="submit" disabled={mutation.isPending} className="btn-primary btn-sm">Save</button>
            <button type="button" className="btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {fields.map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><Icon size={15} /></span>
              <Field label={label} value={patient[key]} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScheduleForm({ patient, isAdmin, onDone }: { patient: Patient; isAdmin: boolean; onDone: () => void }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const doctors = useQuery({ queryKey: ["doctors"], queryFn: () => getDoctors(), enabled: isAdmin });
  const [form, setForm] = useState({
    scheduled_at: "",
    mode: "IN_PERSON",
    chief_complaint: "",
    doctor_id: patient.assigned_doctor?.id ?? "",
  });
  const mutation = useMutation({
    mutationFn: () =>
      createConsultation({
        patient_id: patient.user.id,
        scheduled_at: new Date(form.scheduled_at).toISOString(),
        mode: form.mode,
        chief_complaint: form.chief_complaint,
        ...(isAdmin ? { doctor_id: form.doctor_id } : {}),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["consultations"] });
      void queryClient.invalidateQueries({ queryKey: ["clinical-summary"] });
      toast("Consultation scheduled — the patient has been notified.");
      onDone();
    },
    onError: () => toast("Could not schedule the consultation.", "error"),
  });

  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        if (form.scheduled_at) mutation.mutate();
      }}
      className="space-y-3"
    >
      <label className="block">
        <span className="label">Date & time</span>
        <input type="datetime-local" required className="input" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
      </label>
      <label className="block">
        <span className="label">Mode</span>
        <select className="input" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
          <option value="IN_PERSON">In person</option>
          <option value="VIDEO">Video</option>
          <option value="PHONE">Phone</option>
        </select>
      </label>
      {isAdmin && (
        <label className="block">
          <span className="label">Doctor</span>
          <select required className="input" value={form.doctor_id} onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}>
            <option value="">Select doctor</option>
            {doctors.data?.results.map((d) => (
              <option key={d.id} value={d.user.id}>Dr. {d.user.full_name} — {d.specialization}</option>
            ))}
          </select>
        </label>
      )}
      <label className="block">
        <span className="label">Reason for visit</span>
        <input className="input" value={form.chief_complaint} onChange={(e) => setForm({ ...form, chief_complaint: e.target.value })} />
      </label>
      <button type="submit" disabled={mutation.isPending} className="btn-primary w-full">Schedule</button>
    </form>
  );
}

export default function PatientDetailPage() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [scheduling, setScheduling] = useState(false);

  const patient = useQuery({ queryKey: ["patient", id], queryFn: () => getPatient(id) });
  const consultations = useQuery({
    queryKey: ["consultations", "patient", patient.data?.user.id],
    queryFn: () => getConsultations({ patient: patient.data!.user.id, page_size: "50" }),
    enabled: !!patient.data,
  });
  const photo = useMutation({
    mutationFn: (file: File) => uploadPatientPhoto(id, file),
    onSuccess: (updated) => {
      queryClient.setQueryData(["patient", id], updated);
      toast("Photo updated.");
    },
    onError: () => toast("Please choose a valid image.", "error"),
  });

  if (patient.isLoading) return <Skeleton className="h-96 rounded-3xl" />;
  if (!patient.data) return <EmptyState title="Patient not found" action={<Link to="/patients" className="btn-outline">Back</Link>} />;

  const p = patient.data;
  const isAdmin = hasAnyRole(user, ADMIN_ROLES);
  const isClinicalStaff = hasAnyRole(user, CLINICAL_STAFF_ROLES);
  const canEditClinical = isAdmin || p.assigned_doctor?.id === user?.id;
  const visits = consultations.data?.results ?? [];

  return (
    <div className="space-y-5">
      <Link to="/patients" className="btn-ghost btn-sm"><ArrowLeft size={14} /> All patients</Link>

      <div className="card overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-brand-500 to-accent-500" />
        <div className="flex flex-wrap items-end gap-4 px-6 pb-5">
          <div className="relative -mt-12">
            <Avatar src={p.photo} name={p.user.full_name} size={96} ring />
            {isAdmin && (
              <>
                <button
                  onClick={() => fileInput.current?.click()}
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white shadow"
                  aria-label="Change photo"
                >
                  <Camera size={14} />
                </button>
                <input ref={fileInput} type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && photo.mutate(e.target.files[0])} />
              </>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold text-slate-900">{p.user.full_name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="font-mono">{p.patient_code}</span>
              <span className="flex items-center gap-1"><Mail size={12} />{p.user.email}</span>
              {p.user.phone && <span className="flex items-center gap-1"><Phone size={12} />{p.user.phone}</span>}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {p.age !== null && <Badge tone="slate"><UserRound size={11} /> {p.age} yrs · {p.gender.toLowerCase()}</Badge>}
              <Badge tone="rose"><Droplets size={11} /> {p.blood_group}</Badge>
              {p.allergies && p.allergies !== "None known" && <Badge tone="amber"><ShieldAlert size={11} /> {p.allergies}</Badge>}
              {p.assigned_doctor && <Badge tone="brand"><Stethoscope size={11} /> Dr. {p.assigned_doctor.full_name}</Badge>}
            </div>
          </div>
          {isClinicalStaff && (
            <button className="btn-primary" onClick={() => setScheduling(true)}><CalendarPlus size={16} /> Schedule</button>
          )}
        </div>
      </div>

      <Tabs<Tab>
        tabs={[
          { id: "overview", label: "Overview", icon: UserRound },
          { id: "visits", label: "Visits", icon: History, count: visits.length },
          { id: "vitals", label: "Vitals", icon: Activity },
          { id: "documents", label: "Reports", icon: FileText },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "overview" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="card-pad grid grid-cols-2 gap-4">
            <Field label="Date of birth" value={p.date_of_birth ? formatDate(p.date_of_birth) : null} />
            <Field label="City / State" value={[p.city, p.state].filter(Boolean).join(", ")} />
            <Field label="Emergency contact" value={p.emergency_contact_name} />
            <Field label="Emergency phone" value={p.emergency_contact_phone} />
            <Field label="Address" value={p.address} />
            <Field label="Source enquiry" value={p.source_lead_number} />
            <Field label="Registered" value={formatDate(p.created_at)} />
          </div>
          <ClinicalInfo key={p.updated_at} patient={p} canEdit={canEditClinical} />
        </div>
      )}
      {tab === "visits" &&
        (visits.length ? (
          <VisitTimeline consultations={visits} />
        ) : (
          <EmptyState title="No visits yet" illustration={<CalendarIllustration />} />
        ))}
      {tab === "vitals" && <VitalsPanel patientId={p.id} canAdd={isClinicalStaff} />}
      {tab === "documents" && <DocumentsPanel patientId={p.id} canUpload={isClinicalStaff} />}

      <Modal open={scheduling} onClose={() => setScheduling(false)} title={`Schedule for ${p.user.full_name}`}>
        <ScheduleForm patient={p} isAdmin={isAdmin} onDone={() => setScheduling(false)} />
      </Modal>
    </div>
  );
}
