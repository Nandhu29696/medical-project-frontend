import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Award, Building2, CalendarPlus, IndianRupee, Stethoscope } from "lucide-react";

import { Avatar, PageHeader, Skeleton } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthContext";
import { getDoctors } from "@/lib/api/clinical";
import { hasAnyRole } from "@/lib/roles";

export default function DoctorsPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ["doctors"], queryFn: () => getDoctors() });
  const isPatient = hasAnyRole(user, ["PATIENT"]);

  return (
    <div className="space-y-5">
      <PageHeader title="Doctors" subtitle="Our specialist care team" icon={Stethoscope} />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
        {data?.results.map((doctor) => (
          <div key={doctor.id} className="card overflow-hidden transition hover:shadow-lift">
            <div className="relative h-24 bg-gradient-to-r from-brand-100 to-accent-100">
              <span
                className={`badge absolute right-3 top-3 ${doctor.is_available ? "bg-white text-brand-700" : "bg-white text-slate-500"}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${doctor.is_available ? "bg-brand-500" : "bg-slate-400"}`} />
                {doctor.is_available ? "Available" : "Unavailable"}
              </span>
            </div>
            <div className="-mt-10 px-5 pb-5">
              <Avatar src={doctor.photo} name={doctor.user.full_name} size={80} ring />
              <p className="mt-3 text-lg font-bold text-slate-900">Dr. {doctor.user.full_name}</p>
              <p className="text-sm font-semibold text-accent-600">{doctor.specialization}</p>
              <p className="text-xs text-slate-500">{doctor.qualification}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-slate-50 p-2">
                  <Award size={15} className="mx-auto text-amber-500" />
                  <p className="mt-1 text-sm font-bold text-slate-800">{doctor.years_of_experience}</p>
                  <p className="text-[10px] text-slate-400">years</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2">
                  <IndianRupee size={15} className="mx-auto text-brand-600" />
                  <p className="mt-1 text-sm font-bold text-slate-800">{Number(doctor.consultation_fee).toFixed(0)}</p>
                  <p className="text-[10px] text-slate-400">fee</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2">
                  <Building2 size={15} className="mx-auto text-blue-500" />
                  <p className="mt-1 truncate text-[11px] font-bold text-slate-800" title={doctor.clinic_name}>{doctor.clinic_name.split(" ")[1] ?? "Clinic"}</p>
                  <p className="text-[10px] text-slate-400">clinic</p>
                </div>
              </div>
              {doctor.bio && <p className="mt-3 line-clamp-2 text-xs text-slate-500">{doctor.bio}</p>}
              <p className="mt-2 text-[11px] text-slate-400">Reg. no. {doctor.registration_number}</p>
              {isPatient && doctor.is_available && (
                <Link to="/book" className="btn-primary btn-sm mt-4 w-full"><CalendarPlus size={14} /> Book</Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
