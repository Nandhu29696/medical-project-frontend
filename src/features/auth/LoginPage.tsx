import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";

import { useAuth } from "@/features/auth/AuthContext";
import AuthShell from "@/features/auth/AuthShell";
import { useI18n } from "@/lib/i18n";
import { homePathFor } from "@/lib/roles";
import { loginSchema, type LoginFormValues } from "@/schemas/authSchema";

// Development-only shortcuts that mirror LOGIN_CREDENTIALS.txt; never rendered in production builds.
const DEMO_ACCOUNTS = [
  { label: "Super Admin", email: "superadmin@mediance.demo", password: "SuperAdmin@123" },
  { label: "Admin", email: "admin@mediance.demo", password: "Admin@123" },
  { label: "Doctor", email: "doctor1@mediance.demo", password: "Doctor@123" },
  { label: "Patient", email: "patient1@mediance.demo", password: "Patient@123" },
  { label: "Sales Manager", email: "manager@mediance.demo", password: "Manager@123" },
  { label: "Sales Exec", email: "sales1@mediance.demo", password: "Sales@123" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    try {
      const user = await login(values.email, values.password);
      navigate(homePathFor(user), { replace: true });
    } catch {
      setServerError("Invalid email or password.");
    }
  }

  return (
    <AuthShell>
      <h1 className="text-2xl font-extrabold text-slate-900">{t("login.title")}</h1>
      <p className="mt-1 text-sm text-slate-500">{t("login.subtitle")}</p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="email" className="label">{t("login.email")}</label>
          <input id="email" type="email" autoComplete="email" className="input py-2.5" {...register("email")} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="label">{t("login.password")}</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="input py-2.5 pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>

        {serverError && <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{serverError}</p>}

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
          <LogIn size={16} /> {isSubmitting ? "Signing in..." : t("login.submit")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        {t("login.noAccount")}{" "}
        <Link to="/register" className="font-semibold text-brand-700 hover:underline">
          {t("login.createAccount")}
        </Link>
      </p>

      {import.meta.env.DEV && (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Demo accounts (development only)</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                className="btn-outline btn-sm"
                onClick={() => {
                  setValue("email", account.email);
                  setValue("password", account.password);
                }}
              >
                {account.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </AuthShell>
  );
}
