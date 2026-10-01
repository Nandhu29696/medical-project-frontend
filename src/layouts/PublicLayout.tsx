import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Brain, Mail, MapPin, Menu, MessageCircle, Phone, X } from "lucide-react";
import clsx from "clsx";

import { LanguageSwitcher, ThemeToggle } from "@/components/Switchers";
import { useAuth } from "@/features/auth/AuthContext";
import { CONTACT } from "@/features/public/content";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { homePathFor } from "@/lib/roles";

const NAV: { to: string; key: TranslationKey }[] = [
  { to: "/", key: "nav.home" },
  { to: "/product", key: "nav.product" },
  { to: "/benefits", key: "nav.benefits" },
  { to: "/how-it-works", key: "nav.howItWorks" },
  { to: "/our-doctors", key: "nav.doctors" },
  { to: "/faq", key: "nav.faq" },
  { to: "/contact", key: "nav.contact" },
];

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-sm">
        <Brain size={20} />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-sm font-extrabold text-slate-900">Mediance</span>
          <span className="block text-[11px] font-semibold uppercase tracking-widest text-brand-600">Neuro Life</span>
        </span>
      )}
    </span>
  );
}

export default function PublicLayout() {
  const { t } = useI18n();
  const { user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    clsx(
      "rounded-lg px-3 py-2 text-sm font-medium transition",
      isActive ? "text-brand-700" : "text-slate-600 hover:text-slate-900"
    );

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header
        className={clsx(
          "sticky top-0 z-40 border-b bg-white/85 backdrop-blur transition",
          scrolled ? "border-slate-200 shadow-sm" : "border-transparent"
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" aria-label="Mediance Neuro Life home">
            <Logo />
          </Link>
          <nav className="hidden items-center lg:flex">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === "/"} className={linkClass}>
                {t(item.key)}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <div className="hidden sm:flex sm:items-center">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            <Link to={user ? homePathFor(user) : "/login"} className="btn-ghost hidden sm:inline-flex">
              {user ? t("nav.dashboard") : t("nav.login")}
            </Link>
            <Link to="/enquiry" className="btn-primary hidden sm:inline-flex">
              {t("nav.enquire")}
            </Link>
            <button
              className="btn-ghost h-10 w-10 !px-0 lg:hidden"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="animate-fade-in border-t border-slate-200 bg-white px-4 pb-4 lg:hidden">
            <nav className="flex flex-col py-2">
              {NAV.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.to === "/"} className={linkClass}>
                  {t(item.key)}
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center gap-1 border-t border-slate-100 pt-3">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link to={user ? homePathFor(user) : "/login"} className="btn-outline">
                {user ? t("nav.dashboard") : t("nav.login")}
              </Link>
              <Link to="/enquiry" className="btn-primary">
                {t("nav.enquire")}
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Logo />
            <p className="text-sm text-slate-500">{t("footer.tagline")}</p>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-800">{t("footer.explore")}</p>
            <ul className="space-y-2 text-sm text-slate-500">
              {NAV.slice(1, 5).map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="hover:text-brand-700">
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-800">{t("footer.care")}</p>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/register" className="hover:text-brand-700">{t("nav.register")}</Link></li>
              <li><Link to="/login" className="hover:text-brand-700">{t("nav.login")}</Link></li>
              <li><Link to="/faq" className="hover:text-brand-700">{t("nav.faq")}</Link></li>
              <li><Link to="/enquiry" className="hover:text-brand-700">{t("nav.enquire")}</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-800">{t("footer.contact")}</p>
            <ul className="space-y-2 text-sm text-slate-500">
              <li className="flex gap-2"><Phone size={15} className="mt-0.5 shrink-0 text-brand-600" />{CONTACT.phone}</li>
              <li className="flex gap-2"><Mail size={15} className="mt-0.5 shrink-0 text-brand-600" />{CONTACT.email}</li>
              <li className="flex gap-2"><MapPin size={15} className="mt-0.5 shrink-0 text-brand-600" />{CONTACT.address}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-slate-400 md:flex-row md:justify-between">
            <p>© {new Date().getFullYear()} Mediance Neuro Life</p>
            <p className="max-w-2xl md:text-right">{t("footer.disclaimer")}</p>
          </div>
        </div>
      </footer>

      <a
        href={CONTACT.whatsapp}
        target="_blank"
        rel="noreferrer"
        aria-label={t("hero.whatsapp")}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lift transition hover:scale-105"
      >
        <MessageCircle size={26} />
      </a>
    </div>
  );
}
