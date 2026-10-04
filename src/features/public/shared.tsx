import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Award, BadgeCheck, Package } from "lucide-react";

import { ProductBottleIllustration } from "@/components/illustrations";
import { Avatar } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import type { PublicDoctor } from "@/types/clinical";
import type { Product } from "@/types/product";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = true,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-600">{eyebrow}</p>}
      <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-3 text-slate-500">{subtitle}</p>}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  illustration,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  illustration?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-accent-50">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-[1.4fr_1fr] md:py-16">
        <div className="animate-fade-in">
          {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-600">{eyebrow}</p>}
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-4 max-w-xl text-slate-600">{subtitle}</p>}
        </div>
        {illustration && <div className="mx-auto h-44 w-44 md:h-56 md:w-56">{illustration}</div>}
      </div>
    </section>
  );
}

export function PublicDoctorCard({ doctor }: { doctor: PublicDoctor }) {
  const { t } = useI18n();
  return (
    <div className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-lift">
      <div className="relative flex h-40 items-end justify-center bg-gradient-to-br from-brand-100 to-accent-100">
        <div className="translate-y-10">
          <Avatar src={doctor.photo} name={doctor.name} size={96} ring />
        </div>
        {doctor.is_available && (
          <span className="badge absolute right-3 top-3 bg-white/90 text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Available
          </span>
        )}
      </div>
      <div className="px-5 pb-5 pt-12 text-center">
        <p className="flex items-center justify-center gap-1 font-bold text-slate-900">
          Dr. {doctor.name} <BadgeCheck size={16} className="text-brand-600" />
        </p>
        <p className="text-sm font-semibold text-accent-600">{doctor.specialization}</p>
        <p className="mt-1 text-xs text-slate-500">{doctor.qualification}</p>
        <div className="mt-3 flex items-center justify-center gap-1 text-xs text-slate-500">
          <Award size={14} className="text-amber-500" />
          {doctor.years_of_experience}+ {t("common.years")}
        </div>
        {doctor.clinic_name && <p className="mt-1 text-xs text-slate-400">{doctor.clinic_name}</p>}
      </div>
    </div>
  );
}

/** Catalogue card: primary image, price with discount, pack size, details + enquire. */
export function ProductTile({ product }: { product: Product }) {
  const { t } = useI18n();
  const image = product.media.find((m) => m.is_primary && m.media_type === "IMAGE") ?? product.media.find((m) => m.media_type === "IMAGE");
  const mrp = Number(product.mrp);
  const price = Number(product.selling_price);
  const saving = mrp > price ? Math.round((1 - price / mrp) * 100) : 0;
  return (
    <article className="card group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lift">
      <Link to={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-gradient-to-br from-brand-50 to-accent-50">
        {image ? (
          <img src={image.file} alt={image.alt_text} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="p-12">
            <ProductBottleIllustration />
          </div>
        )}
        {saving > 0 && <span className="badge absolute left-3 top-3 bg-white/95 text-brand-700 shadow-sm">{saving}% off</span>}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <Link to={`/product/${product.slug}`} className="text-lg font-bold text-slate-900 hover:text-brand-700">
          {product.name}
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{product.short_description}</p>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <Package size={14} className="text-brand-600" /> {product.pack_size || "—"}
        </p>
        <div className="mt-3 flex items-end gap-2">
          <span className="text-2xl font-extrabold text-slate-900">₹{price.toFixed(0)}</span>
          {saving > 0 && <span className="pb-0.5 text-sm text-slate-400 line-through">₹{mrp.toFixed(0)}</span>}
        </div>
        <div className="mt-auto flex gap-2 pt-4">
          <Link to={`/product/${product.slug}`} className="btn-outline btn-sm flex-1">
            {t("common.viewDetails")}
          </Link>
          <Link to={`/enquiry?product=${product.slug}`} className="btn-primary btn-sm flex-1">
            {t("nav.enquire")} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
