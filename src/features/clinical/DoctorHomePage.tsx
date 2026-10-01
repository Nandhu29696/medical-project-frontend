import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { CalendarCheck, CalendarClock, CheckCircle2, ChevronRight, ClipboardList, Contact, Repeat } from "lucide-react";

import { useToast } from "@/components/Toast";
import { Avatar, EmptyState, Skeleton, StatCard } from "@/components/ui";
import { CalendarIllustration, DoctorIllustration } from "@/components/illustrations";
import { useAuth } from "@/features/auth/AuthContext";
import { ConsultationStatusPill, ModeBadge } from "@/features/clinical/components";
import { getClinicalSummary, getConsultations, updateConsultation } from "@/lib/api/clinical";
import { formatDate, formatTime, greeting, localDateKey } from "@/lib/format";

export default function DoctorHomePage() {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const today = localDateKey(start);
  const weekAhead = new Date(start);
  weekAhead.setDate(weekAhead.getDate() + 7);

  const summary = useQuery({ queryKey: ["clinical-summary"], queryFn: getClinicalSummary });
  const schedule = useQuery({
    queryKey: ["consultations", "today"],
    queryFn: () =>
      getConsultations({ scheduled_after: start.toISOString(), scheduled_before: end.toISOString(), ordering: "scheduled_at" }),
  });
  const upcoming = useQuery({
    queryKey: ["consultations", "upcoming"],
    queryFn: () =>
      getConsultations({ status: "SCHEDULED", scheduled_after: end.toISOString(), ordering: "scheduled_at", page_size: "5" }),
  });
  const followUps = useQuery({
    queryKey: ["consultations", "follow-ups"],
    queryFn: () =>
      getConsultations({
        status: "COMPLETED",
        follow_up_after: today,
        follow_up_before: localDateKey(weekAhead),
        page_size: "6",
      }),
  });
  const complete = useMutation({
    mutationFn: (id: string) => updateConsultation(id, { status: "COMPLETED" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["consultations"] });
      void queryClient.invalidateQueries({ queryKey: ["clinical-summary"] });
      toast("Marked as completed.");
    },
  });

  const now = Date.now();
  const nextUp = schedule.data?.results.find((c) => c.status === "SCHEDULED" && new Date(c.scheduled_at).getTime() >= now - 30 * 60000);

  return (
    <div className="space-y-6">
      {/* Greeting banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-accent-600 p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
        <div className="relative flex items-center justify-between gap-6">
          <div>
            <p className="text-white/80">{greeting()},</p>
            <h1 className="text-2xl font-extrabold sm:text-3xl">Dr. {user?.full_name}</h1>
            <p className="mt-2 text-white/80">
              You have <b className="text-white">{summary.data?.today_consultations ?? "…"}</b> consultation(s) today
              {nextUp ? (
                <>
                  {" "}— next at <b className="text-white">{formatTime(nextUp.scheduled_at)}</b> with {nextUp.patient.full_name}.
                </>
              ) : (
                "."
              )}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/patients" className="btn bg-white text-brand-700 hover:bg-brand-50"><Contact size={16} /> My patients</Link>
              <Link to="/consultations" className="btn border border-white/40 text-white hover:bg-white/10"><CalendarClock size={16} /> Calendar</Link>
            </div>
          </div>
          <div className="hidden h-36 w-36 shrink-0 rounded-full bg-white/15 p-2 sm:block">
            <DoctorIllustration />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Today" icon={CalendarCheck} tone="brand" value={summary.data?.today_consultations} hint="consultations" />
        <StatCard label="Upcoming" icon={CalendarClock} tone="blue" value={summary.data?.upcoming_consultations} hint="scheduled" />
        <StatCard label="My patients" icon={Contact} tone="accent" value={summary.data?.patients} />
        <StatCard label="Follow-ups due" icon={Repeat} tone="amber" value={summary.data?.follow_ups_due} hint="next 7 days" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        {/* Today's schedule */}
        <section className="card-pad">
          <p className="section-title mb-4 flex items-center gap-2"><ClipboardList size={16} className="text-brand-600" /> Today's schedule</p>
          {schedule.isLoading && <Skeleton className="h-48 rounded-xl" />}
          {schedule.data?.results.length === 0 && (
            <EmptyState title="No consultations today" message="Enjoy the quieter day." illustration={<CalendarIllustration />} />
          )}
          <ol className="relative space-y-3 border-l-2 border-slate-200 pl-6">
            {schedule.data?.results.map((c) => {
              const isNext = c.id === nextUp?.id;
              return (
                <li key={c.id} className="relative">
                  <span
                    className={clsx(
                      "absolute -left-[1.95rem] top-4 h-4 w-4 rounded-full ring-4 ring-white",
                      c.status === "COMPLETED" ? "bg-emerald-500" : isNext ? "animate-pulse bg-accent-500" : "bg-blue-500"
                    )}
                  />
                  <div className={clsx("flex flex-wrap items-center gap-3 rounded-2xl border p-3", isNext ? "border-accent-300 bg-accent-50" : "border-slate-200")}>
                    <p className="w-16 text-sm font-extrabold text-slate-800">{formatTime(c.scheduled_at)}</p>
                    <Avatar name={c.patient.full_name} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-800">{c.patient.full_name}</p>
                      <p className="truncate text-xs text-slate-500">{c.chief_complaint || "Consultation"}</p>
                    </div>
                    <ModeBadge mode={c.mode} />
                    <ConsultationStatusPill status={c.status} />
                    <div className="flex gap-1">
                      {c.status === "SCHEDULED" && (
                        <button className="btn-ghost btn-sm text-brand-700" title="Mark completed" onClick={() => complete.mutate(c.id)}>
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      <Link to={`/consultations/${c.id}`} className="btn-outline btn-sm">
                        {c.status === "SCHEDULED" ? "Start" : "Open"} <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="space-y-5">
          <section className="card-pad">
            <p className="section-title mb-3 flex items-center gap-2"><Repeat size={16} className="text-amber-600" /> Follow-ups due this week</p>
            {followUps.data?.results.length === 0 && <p className="text-sm text-slate-400">No follow-ups due.</p>}
            <ul className="divide-y divide-slate-100">
              {followUps.data?.results.map((c) => (
                <li key={c.id}>
                  <Link to={c.patient_profile_id ? `/patients/${c.patient_profile_id}` : `/consultations/${c.id}`} className="flex items-center gap-3 py-2.5 hover:opacity-80">
                    <Avatar name={c.patient.full_name} size={32} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{c.patient.full_name}</p>
                      <p className="text-xs text-slate-500">Due {c.follow_up_date ? formatDate(c.follow_up_date) : "—"}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section className="card-pad">
            <p className="section-title mb-3 flex items-center gap-2"><CalendarClock size={16} className="text-blue-600" /> Coming up</p>
            {upcoming.data?.results.length === 0 && <p className="text-sm text-slate-400">Nothing scheduled after today.</p>}
            <ul className="divide-y divide-slate-100">
              {upcoming.data?.results.map((c) => (
                <li key={c.id}>
                  <Link to={`/consultations/${c.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:opacity-80">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{c.patient.full_name}</p>
                      <p className="text-xs text-slate-500">{formatDate(c.scheduled_at)} · {formatTime(c.scheduled_at)}</p>
                    </div>
                    <ModeBadge mode={c.mode} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
