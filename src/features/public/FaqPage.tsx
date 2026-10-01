import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Search } from "lucide-react";

import { SupportIllustration } from "@/components/illustrations";
import { Accordion, EmptyState } from "@/components/ui";
import { CONTACT, FAQS } from "@/features/public/content";
import { PageHero } from "@/features/public/shared";
import { useI18n } from "@/lib/i18n";

export default function FaqPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const results = FAQS.filter((item) =>
    `${item.question} ${item.answer}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHero eyebrow={t("nav.faq")} title={t("section.faq")} illustration={<SupportIllustration />} />
      <section className="mx-auto max-w-3xl px-4 py-12">
        <label className="relative block">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input rounded-2xl py-3 pl-11 text-base"
            placeholder="Search questions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <div className="mt-6">
          {results.length ? (
            <Accordion key={search} items={results} />
          ) : (
            <EmptyState title="No matching questions" message="Try another word, or ask our team directly." />
          )}
        </div>
        <div className="card-pad mt-10 flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div className="h-16 w-16 shrink-0">
            <SupportIllustration />
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-900">Still have questions?</p>
            <p className="text-sm text-slate-500">Our care team is happy to help.</p>
          </div>
          <div className="flex gap-2">
            <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer" className="btn-outline">
              <MessageCircle size={16} /> WhatsApp
            </a>
            <Link to="/contact" className="btn-primary">{t("nav.contact")}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
