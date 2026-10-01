export type ProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED";

export interface ProductMedia {
  id: string;
  file: string;
  media_type: "IMAGE" | "VIDEO" | "DOCUMENT";
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  composition: string;
  approved_benefits: string;
  approved_usage: string;
  precautions: string;
  manufacturer: string;
  pack_size: string;
  mrp: string;
  selling_price: string;
  gst_percentage: string;
  status: ProductStatus;
  media: ProductMedia[];
  created_at: string;
  updated_at: string;
}
