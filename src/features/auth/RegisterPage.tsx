import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { UserPlus } from "lucide-react";

import { useAuth } from "@/features/auth/AuthContext";
import AuthShell from "@/features/auth/AuthShell";
import { registerPatient } from "@/lib/api/auth";
import { useI18n } from "@/lib/i18n";

function firstError(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[] | string> } | undefined;
    if (data?.errors) {
      const first = Object.values(data.errors)[0];
      return Array.isArray(first) ? first[0] : String(first);
    }
    return data?.message ?? "Could not create the account.";
  }
  return "Could not create the account.";
}

export default function RegisterPage() {
  const { t } = useI18n();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    date_of_birth: "",
    gender: "UNDISCLOSED",
    city: "",
    consent_given: false,
    whatsapp_opt_in: false,
  });

  const set = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [key]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await registerPatient({ ...form, date_of_birth: form.date_of_birth || null });
      await login(form.email, form.password);
      navigate("/book", { replace: true });
    } catch (err) {
      setError(firstError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <h1 className="text-2xl font-extrabold text-slate-900">Create your patient account</h1>
      <p className="mt-1 text-sm text-slate-500">Book consultations and keep your health records in one place.</p>
      <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
        <div>
          <label className="label" htmlFor="first_name">First name *</label>
          <input id="first_name" required className="input" value={form.first_name} onChange={set("first_name")} />
        </div>
        <div>
          <label className="label" htmlFor="last_name">Last name</label>
          <input id="last_name" className="input" value={form.last_name} onChange={set("last_name")} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="reg-email">Email *</label>
          <input id="reg-email" required type="email" autoComplete="email" className="input" value={form.email} onChange={set("email")} />
        </div>
        <div>
          <label className="label" htmlFor="phone">Mobile</label>
          <input id="phone" type="tel" className="input" value={form.phone} onChange={set("phone")} />
        </div>
        <div>
          <label className="label" htmlFor="city">City</label>
          <input id="city" className="input" value={form.city} onChange={set("city")} />
        </div>
        <div>
          <label className="label" htmlFor="dob">Date of birth</label>
          <input id="dob" type="date" className="input" value={form.date_of_birth} onChange={set("date_of_birth")} />
        </div>
        <div>
          <label className="label" htmlFor="gender">Gender</label>
          <select id="gender" className="input" value={form.gender} onChange={set("gender")}>
            <option value="UNDISCLOSED">Prefer not to say</option>
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="reg-password">Password * (min 8 characters, not too common)</label>
          <input id="reg-password" required minLength={8} type="password" autoComplete="new-password" className="input" value={form.password} onChange={set("password")} />
        </div>
        <label className="flex items-start gap-2 text-xs text-slate-500 sm:col-span-2">
          <input type="checkbox" required className="mt-0.5 h-4 w-4 accent-brand-600" checked={form.consent_given} onChange={set("consent_given")} />
          I agree to my information being stored to provide care and to be contacted about my consultations.
        </label>
        <label className="flex items-start gap-2 text-xs text-slate-500 sm:col-span-2">
          <input type="checkbox" className="mt-0.5 h-4 w-4 accent-brand-600" checked={form.whatsapp_opt_in} onChange={set("whatsapp_opt_in")} />
          Send me appointment confirmations and reminders on WhatsApp (optional; uses the mobile number above).
        </label>
        {error && <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700 sm:col-span-2">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary py-3 sm:col-span-2">
          <UserPlus size={16} /> {submitting ? "Creating account…" : t("nav.register")}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already registered?{" "}
        <Link to="/login" className="font-semibold text-brand-700 hover:underline">{t("nav.login")}</Link>
      </p>
    </AuthShell>
  );
}
