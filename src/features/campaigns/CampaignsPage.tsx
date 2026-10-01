import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import {
  CalendarDays,
  Camera,
  Globe,
  Megaphone,
  MessageCircle,
  QrCode,
  Search,
  ThumbsUp,
  Users,
  Youtube,
  type LucideIcon,
} from "lucide-react";

import { EmptyState, PageHeader, Skeleton } from "@/components/ui";
import { getCampaigns } from "@/lib/api/campaigns";
import { formatDate } from "@/lib/format";
import type { CampaignPlatform, CampaignStatus } from "@/types/campaign";

const PLATFORM: Record<CampaignPlatform, { icon: LucideIcon; color: string; label: string }> = {
  META: { icon: ThumbsUp, color: "from-blue-500 to-blue-700", label: "Meta / Facebook" },
  GOOGLE: { icon: Search, color: "from-amber-400 to-red-500", label: "Google" },
  INSTAGRAM: { icon: Camera, color: "from-pink-500 to-purple-600", label: "Instagram" },
  WHATSAPP: { icon: MessageCircle, color: "from-green-500 to-emerald-600", label: "WhatsApp" },
  YOUTUBE: { icon: Youtube, color: "from-red-500 to-red-700", label: "YouTube" },
  ORGANIC: { icon: Globe, color: "from-brand-500 to-brand-700", label: "Organic" },
  REFERRAL: { icon: Users, color: "from-accent-500 to-accent-700", label: "Referral" },
  QR: { icon: QrCode, color: "from-slate-600 to-slate-800", label: "QR code" },
  OTHER: { icon: Megaphone, color: "from-slate-400 to-slate-600", label: "Other" },
};

const STATUS: Record<CampaignStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  PAUSED: "bg-amber-50 text-amber-700",
  ENDED: "bg-slate-100 text-slate-500",
};

export default function CampaignsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["campaigns"], queryFn: getCampaigns });

  return (
    <div className="space-y-5">
      <PageHeader title="Campaigns" subtitle="Where your leads come from" icon={Megaphone} />
      {!isLoading && data?.results.length === 0 && <EmptyState title="No campaigns yet" />}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
        {data?.results.map((c) => {
          const platform = PLATFORM[c.platform] ?? PLATFORM.OTHER;
          const Icon = platform.icon;
          return (
            <div key={c.id} className="card overflow-hidden transition hover:shadow-lift">
              <div className={clsx("flex items-center justify-between bg-gradient-to-r p-4 text-white", platform.color)}>
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20"><Icon size={18} /></span>
                  {platform.label}
                </span>
                <span className={clsx("badge", STATUS[c.status])}>{c.status}</span>
              </div>
              <div className="p-4">
                <p className="font-bold text-slate-900">{c.name}</p>
                <p className="mt-0.5 font-mono text-xs text-slate-400">{c.campaign_code}</p>
                {c.description && <p className="mt-2 line-clamp-2 text-sm text-slate-500">{c.description}</p>}
                <p className="mt-3 flex items-center gap-1 text-xs text-slate-500">
                  <CalendarDays size={13} /> {formatDate(c.start_date)} → {c.end_date ? formatDate(c.end_date) : "ongoing"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
