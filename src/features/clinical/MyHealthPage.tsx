import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Award,
  Building2,
  CalendarCheck,
  CalendarPlus,
  Camera,
  Clock,
  Droplets,
  FileText,
  HeartPulse,
  History,
  Pill,
  ShieldAlert,
} from "lucide-react";

import { useToast } from "@/components/Toast";
import { Avatar, EmptyState, Skeleton, Tabs } from "@/components/ui";
import { CalendarIllustration, DoctorIllustration } from "@/components/illustrations";
import { useAuth } from "@/features/auth/AuthContext";
import DocumentsPanel from "@/features/clinical/DocumentsPanel";
import VitalsPanel from "@/features/clinical/VitalsPanel";
import { Field, ModeBadge, PrescriptionTable, VisitTimeline } from "@/features/clinical/components";
import { getConsultations, getDoctors, getMyPatientProfile, uploadMyPatientPhoto } from "@/lib/api/clinical";
import { countdown, formatDate, formatTime, greeting } from "@/lib/format";

type Tab = "overview" | "visits" | "vitals" | "documents";

export default function MyHealthPage() {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>("overview");

  const profile = useQuery({ queryKey: ["my-patient-profile"], queryFn: getMyPatientProfile, retry: false });
  const consultations = useQuery({
    queryKey: ["consultations", "mine"],
    queryFn: () => getConsultations({ page_size: "50" }),
  });
  const doctors = useQuery({ queryKey: ["doctors"], queryFn: () => getDoctors() });
  const photo = useMutation({
    mutationFn: uploadMyPatientPhoto,
    onSuccess: (updated) => {
      queryClient.setQueryData(["my-patient-profile"], updated);
      toast("Profile photo updated.");
    },
    onError: () => toast("Please choose a valid image file.", "error"),
  });

  if (profile.isLoading) return <Skeleton className="h-96 rounded-3xl" />;
  if (!profile.data) {
    return <EmptyState title="No patient profile yet" message="Please contact the clinic to link a patient profile to your account." />;
  }

  const p = profile.data;
  const doctor = doctors.data?.results.find((d) => d.user.id === p.assigned_doctor?.id);
  const all = consultations.data?.results ?? [];
  const now = Date.now();
  const upcoming = all
    .filter((c) => c.status === "SCHEDULED" && new Date(c.scheduled_at).getTime() >= now)
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
  const next = upcoming[0];
  const lastWithRx = all.find((c) => c.prescription_items.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative">
          <Avatar src={p.photo} name={p.user.full_name} size={72} ring />
          <button
            onClick={() => fileInput.current?.click()}
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white shadow"
            aria-label="Change photo"
          >
            <Camera size={14} />
          </button>
          <input ref={fileInput} type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && photo.mutate(e.target.files[0])} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-500">{greeting()},</p>
          <h1 className="text-2xl font-extrabold text-slate-900">{user?.first_name || p.user.full_name}</h1>
          <p className="font-mono text-xs text-slate-400">{p.patient_code}</p>
        </div>
        <Link to="/book" className="btn-primary"><CalendarPlus size={16} /> Book consultation</Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Next appointment */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-accent-600 p-6 text-white lg:col-span-2">
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
          {next ? (
            <div className="relative flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-white/80"><CalendarCheck size={16} /> Next appointment</p>
                <p className="mt-2 text-3xl font-extrabold">{formatDate(next.scheduled_at)}</p>
                <p className="text-lg text-white/90">{formatTime(next.scheduled_at)}</p>
                <p className="mt-2 text-sm text-white/80">
                  with Dr. {next.doctor.full_name}
                  {next.doctor_specialization ? ` · ${next.doctor_specialization}` : ""}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                  <Clock size={12} /> {countdown(next.scheduled_at)}
                </span>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="rounded-xl bg-white/15 px-3 py-2"><ModeBadge mode={next.mode} className="font-semibold text-white" /></span>
                <Link to={`/consultations/${next.id}`} className="btn bg-white text-brand-700 hover:bg-brand-50">View details</Link>
              </div>
            </div>
          ) : (
            <div className="relative flex items-center gap-6">
              <div className="h-24 w-24 shrink-0 rounded-2xl bg-white/15 p-2"><CalendarIllustration /></div>
              <div>
                <p className="text-xl font-extrabold">No upcoming appointments</p>
                <p className="text-sm text-white/80">Book a consultation with one of our doctors.</p>
                <Link to="/book" className="btn mt-3 bg-white text-brand-700 hover:bg-brand-50">Book now</Link>
              </div>
            </div>
          )}
        </div>

        {/* Doctor card */}
        <div className="card-pad">
          <p className="section-title mb-4">My doctor</p>
          {doctor ? (
            <div className="text-center">
              <div className="mx-auto w-fit"><Avatar src={doctor.photo} name={doctor.user.full_name} size={80} ring /></div>
              <p className="mt-3 font-bold text-slate-900">Dr. {doctor.user.full_name}</p>
              <p className="text-sm font-semibold text-accent-600">{doctor.specialization}</p>
              <p className="mt-1 text-xs text-slate-500">{doctor.qualification}</p>
              <div className="mt-3 flex justify-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Award size={13} className="text-amber-500" /> {doctor.years_of_experience} yrs</span>
                <span className="flex items-center gap-1"><Building2 size={13} /> {doctor.clinic_name}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="h-16 w-16"><DoctorIllustration /></div>
              <p className="text-sm text-slate-500">No doctor assigned yet — booking a consultation assigns one.</p>
            </div>
          )}
        </div>
      </div>

      <Tabs<Tab>
        tabs={[
          { id: "overview", label: "Overview", icon: HeartPulse },
          { id: "visits", label: "Visits", icon: History, count: all.length },
          { id: "vitals", label: "Vitals", icon: Activity },
          { id: "documents", label: "Reports", icon: FileText },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "overview" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="card-pad">
            <p className="section-title mb-4">Health profile</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Age" value={p.age} />
              <Field label="Date of birth" value={p.date_of_birth ? formatDate(p.date_of_birth) : null} />
              <div className="flex items-start gap-2"><Droplets size={16} className="mt-3 text-red-500" /><Field label="Blood group" value={p.blood_group} /></div>
              <div className="flex items-start gap-2"><ShieldAlert size={16} className="mt-3 text-amber-500" /><Field label="Allergies" value={p.allergies} /></div>
              <Field label="Current medications" value={p.current_medications} />
              <Field label="Emergency contact" value={`${p.emergency_contact_name} ${p.emergency_contact_phone}`.trim()} />
            </div>
          </div>
          <div className="card-pad">
            <p className="section-title mb-4 flex items-center gap-2"><Pill size={16} className="text-accent-600" /> Latest prescription</p>
            {lastWithRx ? (
              <>
                <p className="mb-3 text-xs text-slate-500">
                  From Dr. {lastWithRx.doctor.full_name} on {formatDate(lastWithRx.scheduled_at)}
                </p>
                <PrescriptionTable items={lastWithRx.prescription_items} />
                <Link to={`/consultations/${lastWithRx.id}`} className="btn-outline btn-sm mt-3">Open visit summary</Link>
              </>
            ) : (
              <p className="text-sm text-slate-400">No prescriptions yet.</p>
            )}
          </div>
        </div>
      )}

      {tab === "visits" &&
        (all.length ? (
          <VisitTimeline consultations={all} />
        ) : (
          <EmptyState title="No visits yet" illustration={<CalendarIllustration />} action={<Link to="/book" className="btn-primary">Book consultation</Link>} />
        ))}

      {tab === "vitals" && <VitalsPanel patientId={p.id} canAdd />}
      {tab === "documents" && <DocumentsPanel patientId={p.id} canUpload />}
    </div>
  );
}
