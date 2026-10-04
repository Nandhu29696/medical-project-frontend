import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { ProductBottleIllustration } from "@/components/illustrations";
import { DemoNote, EmptyState, Skeleton } from "@/components/ui";
import { PageHero, ProductTile } from "@/features/public/shared";
import { getPublicProducts } from "@/lib/api/products";
import { useI18n } from "@/lib/i18n";

type Sort = "featured" | "price-asc" | "price-desc" | "name";

export default function ProductsCatalogPage() {
  const { t } = useI18n();
  const { data, isLoading } = useQuery({ queryKey: ["public-products"], queryFn: getPublicProducts });
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("featured");

  const products = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = (data ?? []).filter((p) => `${p.name} ${p.short_description} ${p.pack_size}`.toLowerCase().includes(term));
    const price = (p: (typeof list)[number]) => Number(p.selling_price);
    if (sort === "price-asc") return [...list].sort((a, b) => price(a) - price(b));
    if (sort === "price-desc") return [...list].sort((a, b) => price(b) - price(a));
    if (sort === "name") return [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [data, search, sort]);

  return (
    <div>
      <PageHero
        eyebrow={t("nav.product")}
        title="Our products"
        subtitle="Neuro-wellness products, each backed by advice from our care team. Ask a doctor before starting any supplement."
        illustration={<ProductBottleIllustration />}
      />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search products</span>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-500">
            Sort
            <select className="input w-auto" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">Name</option>
            </select>
          </label>
        </div>
        <p className="mt-3 text-sm text-slate-500">{isLoading ? t("common.loading") : `${products.length} product${products.length === 1 ? "" : "s"}`}</p>
        <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[30rem] rounded-2xl" />)}
          {products.map((p) => (
            <ProductTile key={p.id} product={p} />
          ))}
        </div>
        {!isLoading && products.length === 0 && <EmptyState title="No products match your search" />}
        <div className="mt-10 text-center">
          <DemoNote>Demo catalogue — names, prices and descriptions must be replaced with client-approved information</DemoNote>
        </div>
      </section>
    </div>
  );
}
