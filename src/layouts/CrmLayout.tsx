import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import {
  BarChart3,
  CalendarCheck,
  CalendarClock,
  ChevronDown,
  ClipboardList,
  Contact,
  Globe,
  HeartPulse,
  History,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Package,
  Palette,
  Send,
  Stethoscope,
  Sun,
  UserCog,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import NotificationBell from "@/components/NotificationBell";
import { LanguageSwitcher, ThemeToggle } from "@/components/Switchers";
import { Avatar, Badge } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthContext";
import { Logo } from "@/layouts/PublicLayout";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { ADMIN_ROLES, CLINICAL_STAFF_ROLES, CRM_ROLES, ROLE_LABELS, hasAnyRole } from "@/lib/roles";
import type { UserRole } from "@/types/auth";

interface NavItem {
  to: string;
  label: TranslationKey;
  icon: LucideIcon;
  /** Omitted = visible to every signed-in user. */
  roles?: UserRole[];
}

const NAV_GROUPS: { label: TranslationKey; items: NavItem[] }[] = [
  {
    label: "nav.group.care",
    items: [
      { to: "/doctor", label: "nav.doctorHome", icon: Sun, roles: ["DOCTOR"] },
      { to: "/my-health", label: "nav.myHealth", icon: HeartPulse, roles: ["PATIENT"] },
      { to: "/book", label: "nav.bookConsultation", icon: CalendarCheck, roles: ["PATIENT"] },
      { to: "/patients", label: "nav.patients", icon: Contact, roles: CLINICAL_STAFF_ROLES },
      { to: "/consultations", label: "nav.consultations", icon: ClipboardList },
      { to: "/doctors", label: "nav.doctors", icon: Stethoscope },
      { to: "/products", label: "nav.products", icon: Package },
    ],
  },
  {
    label: "nav.group.sales",
    items: [
      { to: "/dashboard", label: "nav.dashboard", icon: LayoutDashboard, roles: CRM_ROLES },
      { to: "/leads", label: "nav.leads", icon: Users, roles: CRM_ROLES },
      { to: "/followups", label: "nav.followups", icon: CalendarClock, roles: CRM_ROLES },
      { to: "/campaigns", label: "nav.campaigns", icon: Megaphone, roles: CRM_ROLES },
      { to: "/reports", label: "nav.reports", icon: BarChart3, roles: CRM_ROLES },
    ],
  },
  {
    label: "nav.group.admin",
    items: [
      { to: "/users", label: "nav.users", icon: UserCog, roles: ADMIN_ROLES },
      { to: "/audit-logs", label: "nav.audit", icon: History, roles: ADMIN_ROLES },
      { to: "/settings/theme", label: "nav.theme", icon: Palette, roles: ["SUPER_ADMIN"] },
      { to: "/settings/messaging", label: "nav.messaging", icon: Send, roles: ["SUPER_ADMIN"] },
    ],
  },
];

function ProfileMenu() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-xl p-1 pr-2 hover:bg-slate-100">
        <Avatar name={user.full_name} size={34} />
        <span className="hidden text-left md:block">
          <span className="block text-sm font-semibold leading-tight text-slate-800">{user.full_name}</span>
          <span className="block text-[11px] text-slate-400">{ROLE_LABELS[user.role]}</span>
        </span>
        <ChevronDown size={14} className="hidden text-slate-400 md:block" />
      </button>
      {open && (
        <div className="card absolute right-0 z-50 mt-2 w-64 animate-fade-in p-2">
          <div className="px-3 py-2">
            <p className="text-sm font-bold text-slate-800">{user.full_name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {user.roles.map((role) => (
                <Badge key={role} tone="brand">{ROLE_LABELS[role]}</Badge>
              ))}
            </div>
          </div>
          <div className="my-1 border-t border-slate-100" />
          <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
            <UserRound size={16} /> {t("nav.profile")}
          </Link>
          <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
            <Globe size={16} /> Public website
          </Link>
          <button
            onClick={async () => {
              await logout();
              navigate("/login", { replace: true });
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} /> {t("nav.logout")}
          </button>
        </div>
      )}
    </div>
  );
}

export default function CrmLayout() {
  const { user } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const groups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.roles || hasAnyRole(user, item.roles)),
  })).filter((group) => group.items.length > 0);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Link to="/"><Logo /></Link>
        <button className="btn-ghost btn-sm lg:hidden" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
          <X size={18} />
        </button>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">{t(group.label)}</p>
            <div className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    clsx(
                      "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                      isActive ? "bg-brand-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )
                  }
                >
                  <Icon size={18} />
                  {t(label)}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="m-3 rounded-2xl bg-gradient-to-br from-brand-50 to-accent-50 p-4">
        <p className="text-xs font-bold text-slate-800">Need help?</p>
        <p className="mt-1 text-[11px] text-slate-500">See LOGIN_CREDENTIALS.txt for demo accounts.</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="no-print sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white lg:block">{sidebar}</aside>

      {drawerOpen && (
        <div className="no-print fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] animate-fade-in bg-white shadow-lift">{sidebar}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-slate-200 bg-white/85 px-4 py-2.5 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2">
            <button className="btn-ghost h-9 w-9 !px-0 lg:hidden" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <span className="lg:hidden"><Logo compact /></span>
          </div>
          <div className="flex items-center gap-1">
            <span className="hidden sm:block"><LanguageSwitcher /></span>
            <ThemeToggle />
            <NotificationBell />
            <ProfileMenu />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-7xl animate-fade-in" key={location.pathname}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
