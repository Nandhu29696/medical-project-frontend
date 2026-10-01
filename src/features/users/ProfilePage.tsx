import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Camera, HeartPulse, KeyRound, Save, Stethoscope, UserRound } from "lucide-react";

import { useToast } from "@/components/Toast";
import { Avatar, Badge, PageHeader } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthContext";
import { changePassword, updateMe } from "@/lib/api/auth";
import { getMyDoctorProfile, updateMyDoctorProfile } from "@/lib/api/clinical";
import { ROLE_LABELS, hasAnyRole } from "@/lib/roles";
import ContactPreferencesCard from "@/features/users/ContactPreferencesCard";
import type { Doctor } from "@/types/clinical";

function apiError(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    const errors = error.response?.data?.errors as Record<string, string[]> | undefined;
    const first = errors && Object.values(errors)[0];
    return (Array.isArray(first) ? first[0] : undefined) ?? error.response?.data?.message ?? fallback;
  }
  return fallback;
}

function AccountForm() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ first_name: user?.first_name ?? "", last_name: user?.last_name ?? "", phone: user?.phone ?? "" });
  const mutation = useMutation({
    mutationFn: () => updateMe(form),
    onSuccess: async () => {
      await refreshUser();
      toast("Profile updated.");
    },
    onError: (e) => toast(apiError(e, "Could not update profile."), "error"),
  });

  return (
    <form
      className="card-pad space-y-4"
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <p className="section-title flex items-center gap-2"><UserRound size={16} className="text-brand-600" /> Account details</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label><span className="label">First name</span><input className="input" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></label>
        <label><span className="label">Last name</span><input className="input" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></label>
        <label><span className="label">Phone</span><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
        <label><span className="label">Email</span><input className="input" value={user?.email ?? ""} disabled /></label>
      </div>
      <button type="submit" className="btn-primary" disabled={mutation.isPending}><Save size={16} /> Save</button>
    </form>
  );
}

function PasswordForm() {
  const toast = useToast();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const mutation = useMutation({
    mutationFn: () => changePassword(form.current, form.next),
    onSuccess: () => {
      setForm({ current: "", next: "", confirm: "" });
      toast("Password changed.");
    },
    onError: (e) => toast(apiError(e, "Could not change password."), "error"),
  });
  const mismatch = form.confirm.length > 0 && form.next !== form.confirm;

  return (
    <form
      className="card-pad space-y-4"
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        if (!mismatch) mutation.mutate();
      }}
    >
      <p className="section-title flex items-center gap-2"><KeyRound size={16} className="text-accent-600" /> Change password</p>
      <label className="block"><span className="label">Current password</span><input type="password" required autoComplete="current-password" className="input" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} /></label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label><span className="label">New password</span><input type="password" required minLength={8} autoComplete="new-password" className="input" value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} /></label>
        <label><span className="label">Confirm new password</span><input type="password" required autoComplete="new-password" className="input" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} /></label>
      </div>
      {mismatch && <p className="text-xs text-red-600">Passwords do not match.</p>}
      <button type="submit" className="btn-primary" disabled={mutation.isPending || mismatch}>Update password</button>
    </form>
  );
}

function DoctorProfileForm({ doctor }: { doctor: Doctor }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    bio: doctor.bio,
    clinic_name: doctor.clinic_name,
    consultation_fee: doctor.consultation_fee,
    is_available: doctor.is_available,
  });
  const save = useMutation({
    mutationFn: (payload: FormData | Partial<Doctor>) => updateMyDoctorProfile(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(["my-doctor-profile"], updated);
      void queryClient.invalidateQueries({ queryKey: ["doctors"] });
      toast("Doctor profile updated.");
    },
    onError: () => toast("Could not update doctor profile.", "error"),
  });

  return (
    <div className="card-pad space-y-4">
      <p className="section-title flex items-center gap-2"><Stethoscope size={16} className="text-brand-600" /> Public doctor profile</p>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar src={doctor.photo} name={doctor.user.full_name} size={80} ring />
          <button onClick={() => fileInput.current?.click()} className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white shadow" aria-label="Change photo">
            <Camera size={13} />
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const data = new FormData();
              data.append("photo", file);
              save.mutate(data);
            }}
          />
        </div>
        <div>
          <p className="font-bold text-slate-800">Dr. {doctor.user.full_name}</p>
          <p className="text-sm text-accent-600">{doctor.specialization}</p>
          <p className="text-xs text-slate-400">Reg. {doctor.registration_number}</p>
        </div>
      </div>
      <label className="block"><span className="label">Bio</span><textarea rows={3} className="input" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label><span className="label">Clinic</span><input className="input" value={form.clinic_name} onChange={(e) => setForm({ ...form, clinic_name: e.target.value })} /></label>
        <label><span className="label">Consultation fee (₹)</span><input type="number" min={0} className="input" value={form.consultation_fee} onChange={(e) => setForm({ ...form, consultation_fee: e.target.value })} /></label>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" className="h-4 w-4 accent-brand-600" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} />
        Available for new bookings
      </label>
      <button className="btn-primary" disabled={save.isPending} onClick={() => save.mutate(form)}><Save size={16} /> Save doctor profile</button>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const isDoctor = hasAnyRole(user, ["DOCTOR"]);
  const doctor = useQuery({ queryKey: ["my-doctor-profile"], queryFn: getMyDoctorProfile, enabled: isDoctor, retry: false });

  if (!user) return null;
  return (
    <div className="space-y-5">
      <PageHeader title="My profile" subtitle="Manage your account and security" icon={UserRound} />
      <div className="card flex flex-wrap items-center gap-4 p-5">
        <Avatar name={user.full_name} size={64} />
        <div>
          <p className="text-lg font-bold text-slate-900">{user.full_name}</p>
          <p className="text-sm text-slate-500">{user.email}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {user.roles.map((role) => <Badge key={role} tone="brand">{ROLE_LABELS[role]}</Badge>)}
          </div>
        </div>
        {hasAnyRole(user, ["PATIENT"]) && (
          <Link to="/my-health" className="btn-outline ml-auto"><HeartPulse size={16} /> My Health</Link>
        )}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <AccountForm />
        <PasswordForm />
        <ContactPreferencesCard />
        {doctor.data && <DoctorProfileForm key={doctor.data.id} doctor={doctor.data} />}
      </div>
    </div>
  );
}
