import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, FileText, ShieldCheck } from "lucide-react";

import { HeroBrainIllustration } from "@/components/illustrations";
import { LanguageSwitcher, ThemeToggle } from "@/components/Switchers";
import { Logo } from "@/layouts/PublicLayout";

/** Split-screen frame shared by the sign-in and sign-up pages. */
export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-accent-700 p-10 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10" />
        <Link to="/" className="relative">
          <span className="flex items-center gap-2 text-lg font-extrabold">Mediance Neuro Life</span>
        </Link>
        <div className="relative mx-auto my-auto w-full max-w-sm">
          <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
            <HeroBrainIllustration />
          </div>
          <h2 className="mt-8 text-3xl font-extrabold">One portal for care and sales</h2>
          <ul className="mt-6 space-y-3 text-white/85">
            <li className="flex gap-3"><CalendarCheck size={20} /> Book and manage consultations</li>
            <li className="flex gap-3"><FileText size={20} /> Prescriptions, reports and vitals in one place</li>
            <li className="flex gap-3"><ShieldCheck size={20} /> Role-based access keeps records private</li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="lg:invisible"><Logo /></Link>
          <div className="flex items-center"><LanguageSwitcher /><ThemeToggle /></div>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 pb-10">
          <div className="w-full max-w-md animate-fade-in">{children}</div>
        </div>
      </div>
    </div>
  );
}
