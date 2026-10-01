import type { ReactNode } from "react";
import { Award, BadgeCheck } from "lucide-react";

import { Avatar } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import type { PublicDoctor } from "@/types/clinical";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = true,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-600">{eyebrow}</p>}
      <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-3 text-slate-500">{subtitle}</p>}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  illustration,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  illustration?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-accent-50">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-[1.4fr_1fr] md:py-16">
        <div className="animate-fade-in">
          {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-600">{eyebrow}</p>}
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-4 max-w-xl text-slate-600">{subtitle}</p>}
        </div>
        {illustration && <div className="mx-auto h-44 w-44 md:h-56 md:w-56">{illustration}</div>}
      </div>
    </section>
  );
}

export function PublicDoctorCard({ doctor }: { doctor: PublicDoctor }) {
  const { t } = useI18n();
  return (
    <div className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-lift">
      <div className="relative flex h-40 items-end justify-center bg-gradient-to-br from-brand-100 to-accent-100">
        <div className="translate-y-10">
          <Avatar src={doctor.photo} name={doctor.name} size={96} ring />
        </div>
        {doctor.is_available && (
          <span className="badge absolute right-3 top-3 bg-white/90 text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Available
          </span>
        )}
      </div>
      <div className="px-5 pb-5 pt-12 text-center">
        <p className="flex items-center justify-center gap-1 font-bold text-slate-900">
          Dr. {doctor.name} <BadgeCheck size={16} className="text-brand-600" />
        </p>
        <p className="text-sm font-semibold text-accent-600">{doctor.specialization}</p>
        <p className="mt-1 text-xs text-slate-500">{doctor.qualification}</p>
        <div className="mt-3 flex items-center justify-center gap-1 text-xs text-slate-500">
          <Award size={14} className="text-amber-500" />
          {doctor.years_of_experience}+ {t("common.years")}
        </div>
        {doctor.clinic_name && <p className="mt-1 text-xs text-slate-400">{doctor.clinic_name}</p>}
      </div>
    </div>
  );
}
