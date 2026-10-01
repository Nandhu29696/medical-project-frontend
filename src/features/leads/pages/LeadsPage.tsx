import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";

import { PageHeader, Pagination } from "@/components/ui";
import LeadFiltersBar from "@/features/leads/components/LeadFilters";
import LeadTable from "@/features/leads/components/LeadTable";
import { getLeads } from "@/lib/api/leads";
import type { LeadFilters } from "@/types/lead";

const PAGE_SIZE = 20; // matches the API default page size

export default function LeadsPage() {
  const [filters, setFilters] = useState<LeadFilters>({ page: 1 });
  const { data, isLoading } = useQuery({ queryKey: ["leads", filters], queryFn: () => getLeads(filters) });

  return (
    <div className="space-y-5">
      <PageHeader title="Leads" subtitle={`${data?.count ?? 0} enquiries in total`} icon={Users} />
      <LeadFiltersBar filters={filters} onChange={setFilters} />
      <LeadTable leads={data?.results ?? []} isLoading={isLoading} />
      <Pagination
        page={filters.page ?? 1}
        pageSize={PAGE_SIZE}
        count={data?.count ?? 0}
        onChange={(page) => setFilters((f) => ({ ...f, page }))}
      />
    </div>
  );
}
