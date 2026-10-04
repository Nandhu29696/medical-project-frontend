import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import {
  Award,
  BadgeCheck,
  Building2,
  CalendarPlus,
  GraduationCap,
  IndianRupee,
  Search,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";

import { Avatar, EmptyState, Modal, PageHeader, Skeleton } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthContext";
import { getDoctors } from "@/lib/api/clinical";
import { hasAnyRole } from "@/lib/roles";
import type { Doctor } from "@/types/clinical";

/** One tint per specialisation so the same speciality always reads the same colour. */
const SPECIALITY_TONES = [
  "bg-brand-50 text-brand-700 ring-brand-200",
  "bg-accent-50 text-accent-700 ring-accent-200",
  "bg-blue-50 text-blue-700 ring-blue-200",
  "bg-amber-50 text-amber-700 ring-amber-200",
];

function toneFor(specialization: string, all: string[]) {
  return SPECIALITY_TONES[Math.max(0, all.indexOf(specialization)) % SPECIALITY_TONES.length];
}

function DoctorPhoto({ doctor, size }: { doctor: Doctor; size: number }) {
  return (
    <div className="relative z-10 shrink-0" style={{ width: size, height: size }}>
      <div className="h-full w-full rounded-full bg-white p-1 shadow-lift">
        <Avatar src={doctor.photo} name={doctor.user.full_name} size={size - 8} />
      </div>
      <span
        title={doctor.is_available ? "Available for bookings" : "Not taking bookings"}
        className={clsx(
          "absolute bottom-1 right-1 h-4 w-4 rounded-full border-[3px] border-white",
          doctor.is_available ? "bg-emerald-500" : "bg-slate-400"
        )}
      />
    </div>
  );
}

function Stat({ icon: Icon, value, label, tone }: { icon: typeof Award; value: string; label: string; tone: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5">
      <span className={clsx("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm", tone)}>
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold leading-tight text-slate-800">{value}</p>
        <p className="text-[11px] text-slate-400">{label}</p>
      </div>
    </div>
  );
}

function DoctorCard({
  doctor,
  specialities,
  canBook,
  onView,
}: {
  doctor: Doctor;
  specialities: string[];
  canBook: boolean;
  onView: () => void;
}) {
  return (
    <article className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative h-24 bg-gradient-to-br from-brand-100 via-white to-accent-100">
        <svg className="absolute inset-0 h-full w-full opacity-40" aria-hidden="true">
          <defs>
            <pattern id={`dots-${doctor.id}`} width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="rgb(var(--brand-300))" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#dots-${doctor.id})`} />
        </svg>
        <span
          className={clsx(
            "badge absolute right-3 top-3 bg-white/95 shadow-sm",
            doctor.is_available ? "text-emerald-700" : "text-slate-500"
          )}
        >
          <span className={clsx("h-1.5 w-1.5 rounded-full", doctor.is_available ? "bg-emerald-500" : "bg-slate-400")} />
          {doctor.is_available ? "Available" : "Unavailable"}
        </span>
      </div>

      <div className="relative flex flex-1 flex-col px-5 pb-5">
        <div className="-mt-14 flex justify-center">
          <DoctorPhoto doctor={doctor} size={112} />
        </div>
        <div className="mt-3 text-center">
          <h3 className="flex items-center justify-center gap-1.5 text-lg font-bold text-slate-900">
            Dr. {doctor.user.full_name}
            <BadgeCheck size={18} className="shrink-0 text-brand-600" aria-label="Verified registration" />
          </h3>
          <span className={clsx("mt-1.5 inline-block rounded-full px-3 py-0.5 text-xs font-semibold ring-1", toneFor(doctor.specialization, specialities))}>
            {doctor.specialization}
          </span>
          <p className="mt-2 flex items-center justify-center gap-1 text-xs text-slate-500">
            <GraduationCap size={14} className="shrink-0" /> {doctor.qualification || "—"}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Stat icon={Award} value={`${doctor.years_of_experience}+ yrs`} label="Experience" tone="text-amber-500" />
          <Stat icon={IndianRupee} value={`₹${Number(doctor.consultation_fee).toFixed(0)}`} label="Consultation fee" tone="text-brand-600" />
        </div>

        <ul className="mt-3 space-y-1.5 text-xs text-slate-500">
          <li className="flex items-start gap-2">
            <Building2 size={14} className="mt-0.5 shrink-0 text-slate-400" />
            <span className="min-w-0">{doctor.clinic_name || "Clinic not set"}</span>
          </li>
          <li className="flex items-start gap-2">
            <ShieldCheck size={14} className="mt-0.5 shrink-0 text-slate-400" />
            <span>Reg. no. {doctor.registration_number}</span>
          </li>
        </ul>

        <div className="mt-auto flex gap-2 pt-4">
          <button type="button" onClick={onView} className="btn-outline btn-sm flex-1">
            <UserRound size={14} /> View profile
          </button>
          {canBook && (
            <Link
              to={`/book?doctor=${doctor.id}`}
              aria-disabled={!doctor.is_available}
              className={clsx("btn-primary btn-sm flex-1", !doctor.is_available && "pointer-events-none opacity-50")}
            >
              <CalendarPlus size={14} /> Book
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function DoctorProfile({ doctor, canBook }: { doctor: Doctor; canBook: boolean }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <DoctorPhoto doctor={doctor} size={128} />
        <div className="min-w-0">
          <p className="flex items-center justify-center gap-1.5 text-xl font-bold text-slate-900 sm:justify-start">
            Dr. {doctor.user.full_name} <BadgeCheck size={20} className="text-brand-600" />
          </p>
          <p className="font-semibold text-accent-600">{doctor.specialization}</p>
          <p className="text-sm text-slate-500">{doctor.qualification}</p>
          <p className={clsx("mt-1 text-xs font-semibold", doctor.is_available ? "text-emerald-600" : "text-slate-400")}>
            {doctor.is_available ? "● Taking new bookings" : "● Not taking bookings right now"}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat icon={Award} value={`${doctor.years_of_experience}+ years`} label="Experience" tone="text-amber-500" />
        <Stat icon={IndianRupee} value={`₹${Number(doctor.consultation_fee).toFixed(0)}`} label="Consultation fee" tone="text-brand-600" />
      </div>
      <dl className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-slate-400">Clinic</dt>
          <dd className="font-medium text-slate-800">{doctor.clinic_name || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Registration number</dt>
          <dd className="font-medium text-slate-800">{doctor.registration_number}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs text-slate-400">Email</dt>
          <dd className="font-medium text-slate-800 [overflow-wrap:anywhere]">{doctor.user.email}</dd>
        </div>
      </dl>
      {doctor.bio && (
        <div>
          <p className="section-title mb-1">About</p>
          <p className="text-sm leading-relaxed text-slate-600">{doctor.bio}</p>
        </div>
      )}
      {canBook && doctor.is_available && (
        <Link to={`/book?doctor=${doctor.id}`} className="btn-primary w-full py-3">
          <CalendarPlus size={16} /> Book a consultation with Dr. {doctor.user.full_name.split(" ")[0]}
        </Link>
      )}
    </div>
  );
}

export default function DoctorsPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ["doctors"], queryFn: () => getDoctors({ page_size: "100" }) });
  const [search, setSearch] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [viewing, setViewing] = useState<Doctor | null>(null);
  const canBook = hasAnyRole(user, ["PATIENT"]);

  const doctors = useMemo(() => data?.results ?? [], [data]);
  const specialities = useMemo(() => [...new Set(doctors.map((d) => d.specialization))].sort(), [doctors]);
  const visible = doctors.filter((d) => {
    const text = `${d.user.full_name} ${d.specialization} ${d.clinic_name} ${d.qualification}`.toLowerCase();
    return (
      (!speciality || d.specialization === speciality) &&
      (!availableOnly || d.is_available) &&
      text.includes(search.trim().toLowerCase())
    );
  });
  const availableCount = doctors.filter((d) => d.is_available).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Doctors"
        subtitle={isLoading ? "Our specialist care team" : `${doctors.length} specialists · ${availableCount} taking bookings`}
        icon={Stethoscope}
      />

      <div className="card flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search doctors</span>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search by name, speciality or clinic"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {["", ...specialities].map((s) => (
            <button
              key={s || "all"}
              type="button"
              aria-pressed={speciality === s}
              onClick={() => setSpeciality(s)}
              className={speciality === s ? "btn-primary btn-sm" : "btn-outline btn-sm"}
            >
              {s || "All specialities"}
            </button>
          ))}
          <label className="ml-1 flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600">
            <input
              type="checkbox"
              className="h-4 w-4 accent-brand-600"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
            />
            Available now
          </label>
        </div>
      </div>

      {!isLoading && visible.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No doctors match"
            message="Try another name or speciality, or clear the filters."
            action={
              <button
                className="btn-outline"
                onClick={() => {
                  setSearch("");
                  setSpeciality("");
                  setAvailableOnly(false);
                }}
              >
                Clear filters
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[26rem] rounded-2xl" />)}
          {visible.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} specialities={specialities} canBook={canBook} onView={() => setViewing(doctor)} />
          ))}
        </div>
      )}

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Doctor profile">
        {viewing && <DoctorProfile doctor={viewing} canBook={canBook} />}
      </Modal>
    </div>
  );
}
