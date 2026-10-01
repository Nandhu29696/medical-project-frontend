import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package, Tag } from "lucide-react";

import { ProductBottleIllustration } from "@/components/illustrations";
import { Badge, Modal, PageHeader, Skeleton } from "@/components/ui";
import { getProducts } from "@/lib/api/products";
import type { Product } from "@/types/product";

function ProductCard({ product }: { product: Product }) {
  const images = product.media.filter((m) => m.media_type === "IMAGE");
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const image = images[active];
  const mrp = Number(product.mrp);
  const price = Number(product.selling_price);

  return (
    <div className="card overflow-hidden">
      <div className="grid md:grid-cols-2">
        <div className="bg-gradient-to-br from-brand-50 to-accent-50 p-4">
          <button className="block aspect-square w-full overflow-hidden rounded-2xl" onClick={() => image && setZoom(true)}>
            {image ? (
              <img src={image.file} alt={image.alt_text} className="h-full w-full object-cover" />
            ) : (
              <div className="p-10"><ProductBottleIllustration /></div>
            )}
          </button>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((m, i) => (
                <button key={m.id} onClick={() => setActive(i)} className={`h-14 w-14 overflow-hidden rounded-lg border-2 ${i === active ? "border-brand-500" : "border-transparent"}`}>
                  <img src={m.file} alt={m.alt_text} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xl font-extrabold text-slate-900">{product.name}</p>
            <Badge tone={product.status === "ACTIVE" ? "brand" : "slate"}>{product.status}</Badge>
          </div>
          <p className="text-sm text-slate-500">{product.short_description}</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-extrabold text-slate-900">₹{price.toFixed(0)}</span>
            {mrp > price && <span className="text-slate-400 line-through">₹{mrp.toFixed(0)}</span>}
          </div>
          <dl className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-sm">
            <div><dt className="text-xs text-slate-400">Pack size</dt><dd className="font-medium text-slate-700">{product.pack_size || "—"}</dd></div>
            <div><dt className="text-xs text-slate-400">GST</dt><dd className="font-medium text-slate-700">{Number(product.gst_percentage)}%</dd></div>
            <div className="col-span-2"><dt className="text-xs text-slate-400">Manufacturer</dt><dd className="font-medium text-slate-700">{product.manufacturer || "—"}</dd></div>
            <div className="col-span-2"><dt className="text-xs text-slate-400">Slug</dt><dd className="flex items-center gap-1 font-mono text-xs text-slate-500"><Tag size={12} /> {product.slug}</dd></div>
          </dl>
        </div>
      </div>
      <Modal open={zoom} onClose={() => setZoom(false)} title={product.name} wide>
        {image && <img src={image.file} alt={image.alt_text} className="w-full rounded-xl" />}
      </Modal>
    </div>
  );
}

export default function ProductsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["products"], queryFn: getProducts });

  return (
    <div className="space-y-5">
      <PageHeader title="Products" subtitle="Catalogue and product media" icon={Package} />
      {isLoading && <Skeleton className="h-80 rounded-2xl" />}
      <div className="grid gap-5 2xl:grid-cols-2">
        {data?.results.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </div>
  );
}
