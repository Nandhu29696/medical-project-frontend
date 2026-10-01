import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import clsx from "clsx";
import { Award, Building2, CalendarCheck, Check, Clock, Phone, Video } from "lucide-react";

import { useToast } from "@/components/Toast";
import { Avatar, EmptyState, PageHeader, Skeleton } from "@/components/ui";
import { CalendarIllustration } from "@/components/illustrations";
import { bookConsultation, getDoctors, getDoctorSlots } from "@/lib/api/clinical";
import { formatTime, localDateKey } from "@/lib/format";
import type { Doctor } from "@/types/clinical";

const MODES = [
  { id: "IN_PERSON", label: "In clinic", icon: Building2 },
  { id: "VIDEO", label: "Video call", icon: Video },
  { id: "PHONE", label: "Phone call", icon: Phone },
];

function nextDays(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

function StepTitle({ n, title, done }: { n: number; title: string; done?: boolean }) {
  return (
    <p className="mb-3 flex items-center gap-2 font-bold text-slate-800">
      <span className={clsx("flex h-7 w-7 items-center justify-center rounded-full text-xs", done ? "bg-brand-600 text-white" : "bg-brand-100 text-brand-700")}>
        {done ? <Check size={14} /> : n}
      </span>
      {title}
    </p>
  );
}

export default function BookPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [date, setDate] = useState(() => localDateKey(new Date()));
  const [slot, setSlot] = useState<string | null>(null);
  const [mode, setMode] = useState("VIDEO");
  const [reason, setReason] = useState("");

  const doctors = useQuery({ queryKey: ["doctors"], queryFn: () => getDoctors() });
  const slots = useQuery({
    queryKey: ["slots", doctor?.id, date],
    queryFn: () => getDoctorSlots(doctor!.id, date),
    enabled: !!doctor,
  });

  const booking = useMutation({
    mutationFn: () => bookConsultation({ doctor_id: doctor!.user.id, scheduled_at: slot!, mode, chief_complaint: reason }),
    onSuccess: (consultation) => {
      void queryClient.invalidateQueries({ queryKey: ["consultations"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
      toast("Consultation booked! A confirmation has been added to your notifications.");
      navigate(`/consultations/${consultation.id}`);
    },
    onError: (error) => {
      const message = isAxiosError(error) ? (Object.values(error.response?.data?.errors ?? {})[0] as string[] | undefined)?.[0] : undefined;
      toast(message ?? "Could not book that slot. Please pick another.", "error");
      void queryClient.invalidateQueries({ queryKey: ["slots"] });
      setSlot(null);
    },
  });

  const available = (slots.data?.slots ?? []).filter((s) => s.available);

  return (
    <div className="space-y-5">
      <PageHeader title="Book a consultation" subtitle="Choose a doctor, a day and a time that suits you." icon={CalendarCheck} />
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-5">
          {/* 1. Doctor */}
          <section className="card-pad">
            <StepTitle n={1} title="Choose your doctor" done={!!doctor} />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {doctors.isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
              {doctors.data?.results.map((d) => (
                <button
                  key={d.id}
                  disabled={!d.is_available}
                  onClick={() => {
                    setDoctor(d);
                    setSlot(null);
                  }}
                  className={clsx(
                    "flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition disabled:opacity-50",
                    doctor?.id === d.id ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:border-brand-300"
                  )}
                >
                  <Avatar src={d.photo} name={d.user.full_name} size={52} />
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-800">Dr. {d.user.full_name}</p>
                    <p className="text-xs font-semibold text-accent-600">{d.specialization}</p>
                    <p className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Award size={11} /> {d.years_of_experience} yrs · ₹{Number(d.consultation_fee).toFixed(0)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* 2. Date & time */}
          <section className={clsx("card-pad", !doctor && "pointer-events-none opacity-50")}>
            <StepTitle n={2} title="Pick a date and time" done={!!slot} />
            <div className="flex gap-2 overflow-x-auto pb-2">
              {nextDays(14).map((d) => {
                const key = localDateKey(d);
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setDate(key);
                      setSlot(null);
                    }}
                    className={clsx(
                      "flex w-16 shrink-0 flex-col items-center rounded-xl border-2 py-2 text-xs transition",
                      date === key ? "border-brand-500 bg-brand-600 text-white" : "border-slate-200 text-slate-600 hover:border-brand-300"
                    )}
                  >
                    <span className="font-medium">{d.toLocaleDateString(undefined, { weekday: "short" })}</span>
                    <span className="text-lg font-extrabold">{d.getDate()}</span>
                    <span>{d.toLocaleDateString(undefined, { month: "short" })}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4">
              {slots.isLoading && doctor && <Skeleton className="h-24 rounded-xl" />}
              {doctor && slots.data && available.length === 0 && (
                <EmptyState title="No free slots on this day" message="Try another date." illustration={<CalendarIllustration />} />
              )}
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
                {slots.data?.slots.map((s) => (
                  <button
                    key={s.start}
                    disabled={!s.available}
                    onClick={() => setSlot(s.start)}
                    className={clsx(
                      "rounded-xl border py-2 text-sm font-semibold transition",
                      slot === s.start
                        ? "border-brand-600 bg-brand-600 text-white"
                        : s.available
                          ? "border-slate-200 text-slate-700 hover:border-brand-400 hover:bg-brand-50"
                          : "cursor-not-allowed border-slate-100 text-slate-300 line-through"
                    )}
                  >
                    {formatTime(s.start)}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 3. Details */}
          <section className={clsx("card-pad", !slot && "pointer-events-none opacity-50")}>
            <StepTitle n={3} title="Consultation details" />
            <div className="grid grid-cols-3 gap-2">
              {MODES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  className={clsx(
                    "flex flex-col items-center gap-1 rounded-xl border-2 py-3 text-xs font-semibold transition",
                    mode === id ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-600"
                  )}
                >
                  <Icon size={20} /> {label}
                </button>
              ))}
            </div>
            <label className="mt-4 block">
              <span className="label">Reason for visit</span>
              <textarea rows={3} className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Briefly describe what you'd like to discuss" />
            </label>
          </section>
        </div>

        {/* Summary */}
        <aside className="xl:sticky xl:top-20 xl:self-start">
          <div className="card-pad">
            <p className="section-title">Booking summary</p>
            {doctor ? (
              <div className="mt-4 flex items-center gap-3">
                <Avatar src={doctor.photo} name={doctor.user.full_name} size={48} />
                <div>
                  <p className="font-bold text-slate-800">Dr. {doctor.user.full_name}</p>
                  <p className="text-xs text-slate-500">{doctor.specialization}</p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">No doctor selected yet.</p>
            )}
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-400">Date</dt><dd className="font-semibold text-slate-700">{new Date(`${date}T00:00`).toLocaleDateString(undefined, { dateStyle: "medium" })}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Time</dt><dd className="flex items-center gap-1 font-semibold text-slate-700"><Clock size={13} />{slot ? formatTime(slot) : "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Mode</dt><dd className="font-semibold text-slate-700">{MODES.find((m) => m.id === mode)?.label}</dd></div>
              <div className="flex justify-between border-t border-slate-100 pt-2"><dt className="text-slate-400">Fee</dt><dd className="font-bold text-slate-900">{doctor ? `₹${Number(doctor.consultation_fee).toFixed(0)}` : "—"}</dd></div>
            </dl>
            <button className="btn-primary mt-5 w-full py-3" disabled={!doctor || !slot || booking.isPending} onClick={() => booking.mutate()}>
              <CalendarCheck size={16} /> {booking.isPending ? "Booking…" : "Confirm booking"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
