import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, Search } from "lucide-react";

import { DoctorIllustration } from "@/components/illustrations";
import { EmptyState, Skeleton } from "@/components/ui";
import { PageHero, PublicDoctorCard } from "@/features/public/shared";
import { getPublicDoctors } from "@/lib/api/clinical";
import { useI18n } from "@/lib/i18n";

export default function PublicDoctorsPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["public-doctors"], queryFn: getPublicDoctors });

  const specialties = useMemo(() => [...new Set((data ?? []).map((d) => d.specialization))], [data]);
  const filtered = (data ?? []).filter(
    (d) =>
      (!specialty || d.specialization === specialty) &&
      `${d.name} ${d.specialization} ${d.clinic_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHero
        eyebrow={t("nav.doctors")}
        title={t("section.doctors")}
        subtitle={t("section.doctorsSub")}
        illustration={<DoctorIllustration />}
      />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder={`${t("common.search")}…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {["", ...specialties].map((s) => (
              <button
                key={s || "all"}
                onClick={() => setSpecialty(s)}
                className={specialty === s ? "btn-primary btn-sm" : "btn-outline btn-sm"}
              >
                {s || "All"}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
          {filtered.map((doctor) => (
            <PublicDoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
        {!isLoading && filtered.length === 0 && <EmptyState title="No doctors match your search" />}
        <div className="card-pad mt-12 flex flex-col items-center justify-between gap-4 bg-gradient-to-r from-brand-50 to-accent-50 sm:flex-row">
          <div>
            <p className="font-bold text-slate-900">Want to consult one of our doctors?</p>
            <p className="text-sm text-slate-500">Create a free patient account and pick a time that suits you.</p>
          </div>
          <Link to="/register" className="btn-primary">
            <CalendarCheck size={16} /> {t("nav.bookConsultation")}
          </Link>
        </div>
      </section>
    </div>
  );
}
