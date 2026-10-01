import { useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, ShieldCheck, UserCog, UserPlus } from "lucide-react";

import { useToast } from "@/components/Toast";
import { Avatar, Badge, Modal, PageHeader, Pagination, SkeletonRows, type Tone } from "@/components/ui";
import { createUser, getUsers, setUserActive, setUserRoles } from "@/lib/api/users";
import { useAuth } from "@/features/auth/AuthContext";
import { formatDate } from "@/lib/format";
import { ALL_ROLES, ROLE_LABELS } from "@/lib/roles";
import type { CurrentUser, UserRole } from "@/types/auth";

const PAGE_SIZE = 20;

const ROLE_TONES: Record<UserRole, Tone> = {
  SUPER_ADMIN: "rose",
  ADMIN: "amber",
  SALES_MANAGER: "blue",
  SALES_EXECUTIVE: "slate",
  DOCTOR: "accent",
  PATIENT: "brand",
};

function errorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    const fieldError = data?.errors && Object.values(data.errors)[0]?.[0];
    return fieldError || data?.message || "Request failed.";
  }
  return "Request failed.";
}

function RoleEditor({ user, onDone }: { user: CurrentUser; onDone: () => void }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [roles, setRoles] = useState<UserRole[]>(user.roles);
  const mutation = useMutation({
    mutationFn: () => setUserRoles(user.id, roles),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      toast(`Roles updated for ${user.full_name}.`);
      onDone();
    },
    onError: (e) => toast(errorMessage(e), "error"),
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        {ALL_ROLES.map((role) => (
          <label key={role} className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm hover:bg-slate-50">
            <input
              type="checkbox"
              className="h-4 w-4 accent-brand-600"
              checked={roles.includes(role)}
              onChange={(e) => setRoles(e.target.checked ? [...roles, role] : roles.filter((r) => r !== role))}
            />
            <Badge tone={ROLE_TONES[role]}>{ROLE_LABELS[role]}</Badge>
          </label>
        ))}
      </div>
      <button disabled={roles.length === 0 || mutation.isPending} onClick={() => mutation.mutate()} className="btn-primary w-full">
        Save roles
      </button>
    </div>
  );
}

function CreateUserForm({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState({ email: "", first_name: "", last_name: "", phone: "", password: "", role: "PATIENT" as UserRole });
  const mutation = useMutation({
    mutationFn: () => createUser({ ...form, roles: [form.role] }),
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      toast(`${created.full_name} created.`);
      onDone();
    },
    onError: (e) => toast(errorMessage(e), "error"),
  });

  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        mutation.mutate();
      }}
      className="grid gap-3 sm:grid-cols-2"
    >
      <label className="sm:col-span-2"><span className="label">Email</span><input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label><span className="label">First name</span><input className="input" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></label>
      <label><span className="label">Last name</span><input className="input" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></label>
      <label><span className="label">Phone</span><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
      <label>
        <span className="label">Role</span>
        <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
          {ALL_ROLES.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
        </select>
      </label>
      <label className="sm:col-span-2"><span className="label">Password (min 8)</span><input required minLength={8} type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
      <button type="submit" disabled={mutation.isPending} className="btn-primary sm:col-span-2">Create user</button>
    </form>
  );
}

export default function UsersPage() {
  const { user: me } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<CurrentUser | null>(null);
  const [creating, setCreating] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["users", roleFilter, search, page],
    queryFn: () =>
      getUsers({
        page: String(page),
        page_size: String(PAGE_SIZE),
        ...(roleFilter ? { role: roleFilter } : {}),
        ...(search ? { search } : {}),
      }),
  });
  const activeMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => setUserActive(id, active),
    onSuccess: (u) => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      toast(`${u.full_name} ${u.is_active ? "activated" : "deactivated"}.`);
    },
    onError: (e) => toast(errorMessage(e), "error"),
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Users & Roles"
        subtitle="Accounts and their rows in the user_roles table"
        icon={UserCog}
        actions={<button className="btn-primary" onClick={() => setCreating(true)}><UserPlus size={16} /> New user</button>}
      />

      <div className="card flex flex-wrap items-end gap-3 p-4">
        <label className="relative min-w-[220px] flex-1">
          <span className="label">Search</span>
          <Search size={15} className="absolute bottom-2.5 left-3 text-slate-400" />
          <input className="input pl-9" placeholder="Name, email or phone" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </label>
        <div className="flex flex-wrap gap-1">
          {["", ...ALL_ROLES].map((role) => (
            <button
              key={role || "all"}
              onClick={() => { setRoleFilter(role); setPage(1); }}
              className={roleFilter === role ? "btn-primary btn-sm" : "btn-outline btn-sm"}
            >
              {role ? ROLE_LABELS[role as UserRole] : "All roles"}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>User</th>
              <th>Roles</th>
              <th>Status</th>
              <th>Joined</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <SkeletonRows cols={5} />}
            {data?.results.map((u) => (
              <tr key={u.id}>
                <td>
                  <span className="flex items-center gap-3">
                    <Avatar name={u.full_name} size={36} />
                    <span>
                      <span className="block font-semibold text-slate-800">{u.full_name}</span>
                      <span className="block text-xs text-slate-400">{u.email}</span>
                    </span>
                  </span>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {u.roles.map((role) => <Badge key={role} tone={ROLE_TONES[role]}>{ROLE_LABELS[role]}</Badge>)}
                  </div>
                </td>
                <td>
                  <span className={`badge ${u.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {u.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="text-xs text-slate-500">{formatDate(u.created_at)}</td>
                <td className="whitespace-nowrap text-right">
                  {u.id !== me?.id && (
                    <div className="flex justify-end gap-1">
                      <button className="btn-outline btn-sm" onClick={() => setEditing(u)}><ShieldCheck size={13} /> Roles</button>
                      <button className="btn-ghost btn-sm" onClick={() => activeMutation.mutate({ id: u.id, active: !u.is_active })}>
                        {u.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageSize={PAGE_SIZE} count={data?.count ?? 0} onChange={setPage} />

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Roles for ${editing?.full_name ?? ""}`}>
        {editing && <RoleEditor user={editing} onDone={() => setEditing(null)} />}
      </Modal>
      <Modal open={creating} onClose={() => setCreating(false)} title="Create user">
        <CreateUserForm onDone={() => setCreating(false)} />
      </Modal>
    </div>
  );
}
