import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  FileText,
  Info,
  MessageCircle,
  Package,
  ShieldCheck,
  Sparkles,
  Truck,
  ZoomIn,
} from "lucide-react";

import { ProductBottleIllustration } from "@/components/illustrations";
import { DemoNote, Modal, Skeleton, Tabs } from "@/components/ui";
import { CONTACT } from "@/features/public/content";
import { getPublicProducts } from "@/lib/api/products";
import { ProductTile } from "@/features/public/shared";
import { useI18n } from "@/lib/i18n";

type Tab = "description" | "benefits" | "usage" | "precautions";

function Paragraphs({ text }: { text: string }) {
  return (
    <div className="space-y-3 leading-relaxed text-slate-600">
      {text.split(/\n+/).map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </div>
  );
}

export default function ProductPage() {
  const { t } = useI18n();
  const { slug } = useParams();
  const { data, isLoading } = useQuery({ queryKey: ["public-products"], queryFn: getPublicProducts });
  const [activeImage, setActiveImage] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("description");

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-2">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  const product = slug ? data?.find((p) => p.slug === slug) : data?.[0];
  if (!product) {
    return <p className="px-4 py-20 text-center text-slate-500">No product is available right now.</p>;
  }

  const images = product.media.filter((m) => m.media_type === "IMAGE");
  const image = images[activeImage] ?? images[0];
  const others = (data ?? []).filter((p) => p.id !== product.id);
  const mrp = Number(product.mrp);
  const price = Number(product.selling_price);
  const saving = mrp > price ? Math.round((1 - price / mrp) * 100) : 0;
  const demo = t("common.demoNotice");

  const tabContent: Record<Tab, string> = {
    description: product.description || demo,
    benefits: product.approved_benefits || demo,
    usage: product.approved_usage || demo,
    precautions: product.precautions || demo,
  };

  return (
    <div className="bg-gradient-to-b from-brand-50/60 to-white">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <nav className="mb-6 text-xs text-slate-400" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-brand-700">{t("nav.home")}</Link> / <Link to="/product" className="hover:text-brand-700">{t("nav.product")}</Link> / <span className="text-slate-600">{product.name}</span>
        </nav>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          {/* Gallery */}
          <div>
            <button
              className="card group relative block aspect-square w-full overflow-hidden"
              onClick={() => image && setZoomOpen(true)}
              aria-label="Zoom image"
            >
              {image ? (
                <img src={image.file} alt={image.alt_text} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              ) : (
                <div className="p-16"><ProductBottleIllustration /></div>
              )}
              {image && (
                <span className="badge absolute bottom-3 right-3 bg-white/90 text-slate-700 shadow">
                  <ZoomIn size={12} /> Zoom
                </span>
              )}
            </button>
            {images.length > 1 && (
              <div className="mt-3 flex gap-3">
                {images.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => setActiveImage(i)}
                    className={`h-20 w-20 overflow-hidden rounded-xl border-2 transition ${
                      i === activeImage ? "border-brand-500" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                    aria-label={`Show image ${i + 1}`}
                  >
                    <img src={m.file} alt={m.alt_text} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Buy box */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <span className="badge bg-accent-50 text-accent-700"><Sparkles size={12} /> Neuro wellness</span>
            <h1 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">{product.name}</h1>
            <p className="mt-3 text-slate-600">{product.short_description || demo}</p>

            <div className="card-pad mt-6">
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-4xl font-extrabold text-slate-900">₹{price.toFixed(0)}</span>
                {saving > 0 && (
                  <>
                    <span className="text-lg text-slate-400 line-through">MRP ₹{mrp.toFixed(0)}</span>
                    <span className="badge bg-brand-50 text-brand-700">{saving}% off</span>
                  </>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-400">Inclusive of all taxes</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-600"><Package size={16} className="text-brand-600" /> {product.pack_size || "—"}</div>
                <div className="flex items-center gap-2 text-slate-600"><Truck size={16} className="text-brand-600" /> {t("trust.delivery")}</div>
                <div className="flex items-center gap-2 text-slate-600"><ShieldCheck size={16} className="text-brand-600" /> {t("trust.secure")}</div>
                <div className="flex items-center gap-2 text-slate-600"><CalendarCheck size={16} className="text-brand-600" /> {t("trust.doctors")}</div>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <Link to={`/enquiry?product=${product.slug}`} className="btn-primary py-3">{t("nav.enquire")}</Link>
                <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer" className="btn-outline py-3">
                  <MessageCircle size={16} /> {t("hero.whatsapp")}
                </a>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
              <Info size={16} className="mt-0.5 shrink-0" />
              Consult a doctor before starting any supplement, especially if you are pregnant, nursing or taking other medicines.
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mt-12">
          <Tabs<Tab>
            tabs={[
              { id: "description", label: "Description", icon: FileText },
              { id: "benefits", label: "Benefits", icon: CheckCircle2 },
              { id: "usage", label: "How to use", icon: CalendarCheck },
              { id: "precautions", label: "Precautions", icon: AlertTriangle },
            ]}
            active={tab}
            onChange={setTab}
          />
          <div className="card-pad mt-4 animate-fade-in" key={tab}>
            <Paragraphs text={tabContent[tab]} />
            <div className="mt-4"><DemoNote /></div>
          </div>
        </div>

        {others.length > 0 && (
          <div className="mt-14">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-xl font-extrabold text-slate-900">More products</h2>
              <Link to="/product" className="text-sm font-semibold text-brand-700 hover:underline">View all</Link>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.slice(0, 3).map((p) => (
                <ProductTile key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal open={zoomOpen} onClose={() => setZoomOpen(false)} title={product.name} wide>
        {image && <img src={image.file} alt={image.alt_text} className="w-full rounded-xl" />}
      </Modal>
    </div>
  );
}
