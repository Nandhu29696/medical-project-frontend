import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, CalendarClock, ChevronRight, Contact, Repeat, Search } from "lucide-react";

import { Avatar, Badge, EmptyState, PageHeader, Pagination, SkeletonRows, StatCard } from "@/components/ui";
import { getClinicalSummary, getPatients } from "@/lib/api/clinical";

const PAGE_SIZE = 20;

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const summary = useQuery({ queryKey: ["clinical-summary"], queryFn: getClinicalSummary });
  const { data, isLoading } = useQuery({
    queryKey: ["patients", search, page],
    queryFn: () => getPatients({ ...(search ? { search } : {}), page: String(page), page_size: String(PAGE_SIZE) }),
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Patients" subtitle="Profiles, visits, vitals and reports" icon={Contact} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Patients" icon={Contact} tone="brand" value={summary.data?.patients} />
        <StatCard label="Today" icon={CalendarCheck} tone="accent" value={summary.data?.today_consultations} hint="consultations" />
        <StatCard label="Upcoming" icon={CalendarClock} tone="blue" value={summary.data?.upcoming_consultations} hint="scheduled" />
        <StatCard label="Follow-ups due" icon={Repeat} tone="amber" value={summary.data?.follow_ups_due} hint="next 7 days" />
      </div>

      <label className="relative block max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name, email, patient code or city"
          className="input pl-9"
        />
      </label>

      {!isLoading && data?.results.length === 0 ? (
        <div className="card"><EmptyState title="No patients found" message="Try a different search." /></div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Code</th>
                <th>Age / Gender</th>
                <th>Blood</th>
                <th>Doctor</th>
                <th>City</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {isLoading && <SkeletonRows cols={7} />}
              {data?.results.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link to={`/patients/${p.id}`} className="flex items-center gap-3">
                      <Avatar src={p.photo} name={p.user.full_name} size={36} />
                      <span>
                        <span className="block font-semibold text-slate-800">{p.user.full_name}</span>
                        <span className="block text-xs text-slate-400">{p.user.email}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="font-mono text-xs">{p.patient_code}</td>
                  <td className="capitalize">{p.age ?? "—"} / {p.gender.toLowerCase()}</td>
                  <td><Badge tone="rose">{p.blood_group}</Badge></td>
                  <td>{p.assigned_doctor ? `Dr. ${p.assigned_doctor.full_name}` : "—"}</td>
                  <td>{p.city || "—"}</td>
                  <td className="text-right">
                    <Link to={`/patients/${p.id}`} className="btn-outline btn-sm">Open <ChevronRight size={13} /></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} pageSize={PAGE_SIZE} count={data?.count ?? 0} onChange={setPage} />
    </div>
  );
}
