import { Link } from "react-router-dom";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { MapIllustration, SupportIllustration } from "@/components/illustrations";
import { DemoNote } from "@/components/ui";
import { CONTACT } from "@/features/public/content";
import { PageHero } from "@/features/public/shared";
import { useI18n } from "@/lib/i18n";

export default function ContactPage() {
  const { t } = useI18n();
  const cards = [
    { icon: Phone, label: "Call us", value: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/\s/g, "")}` },
    { icon: MessageCircle, label: "WhatsApp", value: "Chat with the care team", href: CONTACT.whatsapp },
    { icon: Mail, label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
  ];

  return (
    <div>
      <PageHero
        eyebrow={t("nav.contact")}
        title="We're here to help"
        subtitle="Reach our care team by phone, WhatsApp or email — or send an enquiry and we'll call you back."
        illustration={<SupportIllustration />}
      />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-5 md:grid-cols-3">
          {cards.map(({ icon: Icon, label, value, href }) => (
            <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
              className="card-pad flex items-center gap-4 transition hover:-translate-y-0.5 hover:shadow-lift">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Icon size={22} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                <p className="font-bold text-slate-800">{value}</p>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="card overflow-hidden">
            <div className="aspect-[16/9]">
              <MapIllustration />
            </div>
            <div className="flex items-start gap-3 p-5">
              <MapPin size={20} className="mt-0.5 shrink-0 text-accent-600" />
              <div>
                <p className="font-bold text-slate-800">Clinic address</p>
                <p className="text-sm text-slate-500">{CONTACT.address}</p>
              </div>
            </div>
          </div>
          <div className="card-pad">
            <p className="flex items-center gap-2 font-bold text-slate-800">
              <Clock size={18} className="text-brand-600" /> Opening hours
            </p>
            <ul className="mt-4 divide-y divide-slate-100 text-sm">
              {CONTACT.hours.map((h) => (
                <li key={h.days} className="flex justify-between py-2.5">
                  <span className="text-slate-600">{h.days}</span>
                  <span className="font-semibold text-slate-800">{h.time}</span>
                </li>
              ))}
            </ul>
            <Link to="/enquiry" className="btn-primary mt-6 w-full">{t("nav.enquire")}</Link>
            <div className="mt-4"><DemoNote>Demo contact details — replace before launch</DemoNote></div>
          </div>
        </div>
      </section>
    </div>
  );
}
