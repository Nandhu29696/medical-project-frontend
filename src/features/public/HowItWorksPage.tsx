import { Link } from "react-router-dom";
import { CalendarCheck, ClipboardList, PhoneCall, Stethoscope } from "lucide-react";

import {
  CalendarIllustration,
  DoctorIllustration,
  ReportIllustration,
  SupportIllustration,
} from "@/components/illustrations";
import { PageHero } from "@/features/public/shared";
import { useI18n, type TranslationKey } from "@/lib/i18n";

const STEPS: {
  icon: typeof ClipboardList;
  title: TranslationKey;
  text: TranslationKey;
  Illustration: typeof ReportIllustration;
  detail: string;
}[] = [
  {
    icon: ClipboardList,
    title: "step.1.title",
    text: "step.1.text",
    Illustration: ReportIllustration,
    detail: "It takes about a minute. We only ask for what we need to call you back.",
  },
  {
    icon: PhoneCall,
    title: "step.2.title",
    text: "step.2.text",
    Illustration: SupportIllustration,
    detail: "Our advisor answers your questions and, if useful, suggests speaking to a doctor.",
  },
  {
    icon: Stethoscope,
    title: "step.3.title",
    text: "step.3.text",
    Illustration: DoctorIllustration,
    detail: "Pick a specialist and an open slot. You'll get a confirmation in your portal.",
  },
  {
    icon: CalendarCheck,
    title: "step.4.title",
    text: "step.4.text",
    Illustration: CalendarIllustration,
    detail: "Prescriptions, lab reports and follow-up dates stay in one secure place.",
  },
];

export default function HowItWorksPage() {
  const { t } = useI18n();
  return (
    <div>
      <PageHero
        eyebrow={t("nav.howItWorks")}
        title={t("section.howItWorks")}
        subtitle={t("section.howItWorksSub")}
        illustration={<CalendarIllustration />}
      />
      <section className="mx-auto max-w-4xl px-4 py-14">
        <ol className="relative space-y-10 border-l-2 border-dashed border-brand-200 pl-8 md:space-y-14">
          {STEPS.map(({ icon: Icon, title, text, Illustration, detail }, index) => (
            <li key={title} className="relative">
              <span className="absolute -left-[3.05rem] flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white shadow ring-4 ring-white">
                <Icon size={18} />
              </span>
              <div className="card-pad grid items-center gap-5 sm:grid-cols-[1fr_120px]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Step {index + 1}</p>
                  <h2 className="mt-1 text-lg font-bold text-slate-900">{t(title)}</h2>
                  <p className="mt-1 text-slate-600">{t(text)}</p>
                  <p className="mt-2 text-sm text-slate-500">{detail}</p>
                </div>
                <div className="mx-auto h-28 w-28">
                  <Illustration />
                </div>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Link to="/enquiry" className="btn-primary px-6 py-3">{t("nav.enquire")}</Link>
          <Link to="/register" className="btn-outline px-6 py-3">{t("nav.register")}</Link>
        </div>
      </section>
    </div>
  );
}
