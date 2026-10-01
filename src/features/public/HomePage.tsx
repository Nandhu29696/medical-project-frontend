import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarCheck,
  ClipboardList,
  MessageSquareText,
  PhoneCall,
  Quote,
  ShieldCheck,
  Star,
  Stethoscope,
  Truck,
  Headset,
} from "lucide-react";

import {
  FocusIllustration,
  HeadacheIllustration,
  HeroBrainIllustration,
  ProductBottleIllustration,
  SleepIllustration,
  StressIllustration,
} from "@/components/illustrations";
import { Accordion, Avatar, DemoNote, Skeleton } from "@/components/ui";
import { FAQS, TESTIMONIALS, CONTACT } from "@/features/public/content";
import { PublicDoctorCard, SectionHeading } from "@/features/public/shared";
import { getPublicDoctors } from "@/lib/api/clinical";
import { getPublicProducts } from "@/lib/api/products";
import { useI18n, type TranslationKey } from "@/lib/i18n";

const STEPS: { icon: typeof ClipboardList; title: TranslationKey; text: TranslationKey }[] = [
  { icon: ClipboardList, title: "step.1.title", text: "step.1.text" },
  { icon: PhoneCall, title: "step.2.title", text: "step.2.text" },
  { icon: Stethoscope, title: "step.3.title", text: "step.3.text" },
  { icon: CalendarCheck, title: "step.4.title", text: "step.4.text" },
];

const FOCUS = [
  { key: "focus.sleep" as const, Illustration: SleepIllustration },
  { key: "focus.focus" as const, Illustration: FocusIllustration },
  { key: "focus.stress" as const, Illustration: StressIllustration },
  { key: "focus.headache" as const, Illustration: HeadacheIllustration },
];

export default function HomePage() {
  const { t } = useI18n();
  const products = useQuery({ queryKey: ["public-products"], queryFn: getPublicProducts });
  const doctors = useQuery({ queryKey: ["public-doctors"], queryFn: getPublicDoctors });
  const product = products.data?.[0];
  const productImage = product?.media.find((m) => m.is_primary) ?? product?.media[0];

  const trust = [
    { icon: Stethoscope, label: t("trust.doctors") },
    { icon: ShieldCheck, label: t("trust.secure") },
    { icon: Truck, label: t("trust.delivery") },
    { icon: Headset, label: t("trust.support") },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-accent-50">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-accent-200/40 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
          <div className="animate-fade-in">
            <span className="badge bg-white text-brand-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> {t("hero.eyebrow")}
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
              {t("hero.title")}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">{t("hero.subtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/enquiry" className="btn-primary px-6 py-3 text-base">
                {t("hero.ctaPrimary")} <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn-outline px-6 py-3 text-base">
                <CalendarCheck size={18} /> {t("hero.ctaSecondary")}
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-3">
                {(doctors.data ?? []).slice(0, 3).map((d) => (
                  <Avatar key={d.id} src={d.photo} name={d.name} size={40} ring />
                ))}
              </div>
              <div className="text-sm">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="text-slate-500">{doctors.data?.length ?? 3}+ specialist doctors on the care team</p>
              </div>
            </div>
          </div>
          <div className="relative mx-auto aspect-[8/7] w-full max-w-md">
            <HeroBrainIllustration />
            <div className="absolute -left-2 top-8 hidden animate-fade-in items-center gap-2 rounded-2xl bg-white p-3 shadow-lift sm:flex">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <CalendarCheck size={18} />
              </span>
              <div>
                <p className="text-xs font-bold text-slate-800">Book online</p>
                <p className="text-[11px] text-slate-500">Video · Phone · Clinic</p>
              </div>
            </div>
            <div className="absolute -right-2 bottom-10 hidden animate-fade-in items-center gap-2 rounded-2xl bg-white p-3 shadow-lift sm:flex">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
                <ShieldCheck size={18} />
              </span>
              <div>
                <p className="text-xs font-bold text-slate-800">Private records</p>
                <p className="text-[11px] text-slate-500">Role-based access</p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative border-t border-slate-200/70 bg-white/60">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-5 md:grid-cols-4">
            {trust.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon size={20} />
                </span>
                <span className="text-sm font-semibold text-slate-700">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <SectionHeading eyebrow={t("nav.howItWorks")} title={t("section.howItWorks")} subtitle={t("section.howItWorksSub")} />
        <div className="relative mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-0 right-0 top-8 hidden border-t-2 border-dashed border-brand-200 lg:block" />
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <div key={title} className="relative text-center">
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-soft ring-1 ring-slate-200">
                <Icon size={28} />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent-600 text-xs font-bold text-white">
                  {index + 1}
                </span>
              </div>
              <p className="mt-4 font-bold text-slate-900">{t(title)}</p>
              <p className="mt-1 text-sm text-slate-500">{t(text)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Product highlight */}
      <section className="bg-slate-50 py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
          <div className="card relative mx-auto aspect-square w-full max-w-md overflow-hidden bg-gradient-to-br from-brand-50 to-accent-50">
            {products.isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : productImage ? (
              <img src={productImage.file} alt={productImage.alt_text} className="h-full w-full object-cover" />
            ) : (
              <div className="p-12">
                <ProductBottleIllustration />
              </div>
            )}
          </div>
          <div>
            <SectionHeading center={false} eyebrow={t("nav.product")} title={t("section.product")} />
            <p className="mt-4 text-slate-600">{product?.short_description || t("common.demoNotice")}</p>
            {product && (
              <div className="mt-6 flex items-end gap-3">
                <span className="text-3xl font-extrabold text-slate-900">₹{Number(product.selling_price).toFixed(0)}</span>
                {Number(product.mrp) > Number(product.selling_price) && (
                  <>
                    <span className="text-lg text-slate-400 line-through">₹{Number(product.mrp).toFixed(0)}</span>
                    <span className="badge bg-brand-50 text-brand-700">
                      Save {Math.round((1 - Number(product.selling_price) / Number(product.mrp)) * 100)}%
                    </span>
                  </>
                )}
              </div>
            )}
            {product?.pack_size && <p className="mt-1 text-sm text-slate-500">Pack size: {product.pack_size}</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/product" className="btn-primary">
                {t("common.viewDetails")} <ArrowRight size={16} />
              </Link>
              <Link to="/enquiry" className="btn-outline">
                {t("nav.enquire")}
              </Link>
            </div>
            <div className="mt-4">
              <DemoNote />
            </div>
          </div>
        </div>
      </section>

      {/* Focus areas */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <SectionHeading eyebrow={t("nav.benefits")} title={t("section.focusAreas")} subtitle={t("section.focusAreasSub")} />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FOCUS.map(({ key, Illustration }) => (
            <Link
              key={key}
              to="/benefits"
              className="card group p-6 text-center transition hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="mx-auto h-24 w-24 transition group-hover:scale-105">
                <Illustration />
              </div>
              <p className="mt-4 font-bold text-slate-900">{t(key)}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                {t("common.learnMore")} <ArrowRight size={14} />
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Doctors */}
      <section className="bg-gradient-to-b from-white to-brand-50/60 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading eyebrow={t("nav.doctors")} title={t("section.doctors")} subtitle={t("section.doctorsSub")} />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.isLoading &&
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
            {doctors.data?.map((doctor) => <PublicDoctorCard key={doctor.id} doctor={doctor} />)}
          </div>
          <div className="mt-8 text-center">
            <Link to="/our-doctors" className="btn-outline">
              {t("section.doctors")} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <SectionHeading eyebrow={t("section.testimonials")} title={t("section.testimonials")} />
        <div className="mt-3 text-center">
          <DemoNote>Sample testimonials — replace with genuine, consented reviews</DemoNote>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <figure key={item.name} className="card-pad relative">
              <Quote size={32} className="absolute right-5 top-5 text-brand-100" />
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <blockquote className="mt-3 text-slate-600">“{item.quote}”</blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <Avatar name={item.name} size={36} />
                <div>
                  <p className="text-sm font-bold text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.city}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ preview */}
      <section className="bg-slate-50 py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionHeading center={false} eyebrow={t("nav.faq")} title={t("section.faq")} />
            <Link to="/faq" className="btn-outline mt-6">
              {t("nav.faq")} <ArrowRight size={16} />
            </Link>
          </div>
          <Accordion items={FAQS.slice(0, 4)} />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-accent-600 px-6 py-12 text-center text-white sm:px-12">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-white/10" />
          <MessageSquareText size={36} className="mx-auto opacity-90" />
          <h2 className="mt-4 text-2xl font-extrabold sm:text-3xl">{t("section.ctaTitle")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">{t("section.ctaSub")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/enquiry" className="btn bg-white px-6 py-3 text-brand-700 hover:bg-brand-50">
              {t("nav.enquire")}
            </Link>
            <Link to="/register" className="btn border border-white/40 px-6 py-3 text-white hover:bg-white/10">
              {t("nav.register")}
            </Link>
            <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer" className="btn border border-white/40 px-6 py-3 text-white hover:bg-white/10">
              {t("hero.whatsapp")}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
