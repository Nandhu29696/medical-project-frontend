import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import {
  FocusIllustration,
  HeadacheIllustration,
  SleepIllustration,
  StressIllustration,
} from "@/components/illustrations";
import { DemoNote } from "@/components/ui";
import { BENEFIT_CARDS } from "@/features/public/content";
import { PageHero } from "@/features/public/shared";
import { getPublicProducts } from "@/lib/api/products";
import { useI18n } from "@/lib/i18n";

const ILLUSTRATIONS = {
  "focus.sleep": SleepIllustration,
  "focus.focus": FocusIllustration,
  "focus.stress": StressIllustration,
  "focus.headache": HeadacheIllustration,
};

export default function BenefitsPage() {
  const { t } = useI18n();
  const { data } = useQuery({ queryKey: ["public-products"], queryFn: getPublicProducts });
  const product = data?.[0];
  const approved = (product?.approved_benefits ?? "").split(/\n+/).filter(Boolean);

  return (
    <div>
      <PageHero
        eyebrow={t("nav.benefits")}
        title={t("section.focusAreas")}
        subtitle={t("section.focusAreasSub")}
        illustration={<FocusIllustration />}
      />
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-6 sm:grid-cols-2">
          {BENEFIT_CARDS.map(({ key, text }) => {
            const Illustration = ILLUSTRATIONS[key];
            return (
              <div key={key} className="card-pad flex gap-5">
                <div className="h-20 w-20 shrink-0">
                  <Illustration />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">{t(key)}</p>
                  <p className="mt-1 text-sm text-slate-500">{text}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card-pad mt-10">
          <h2 className="text-lg font-bold text-slate-900">Approved product benefits</h2>
          <ul className="mt-4 space-y-3">
            {(approved.length ? approved : [t("common.demoNotice")]).map((line) => (
              <li key={line} className="flex gap-2 text-slate-600">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-brand-600" /> {line}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <DemoNote />
            <Link to="/product" className="btn-primary">
              {t("common.viewDetails")} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
