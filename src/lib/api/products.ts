import { apiClient } from "@/lib/api/client";
import type { ApiSuccess, Paginated } from "@/types/common";
import type { Product } from "@/types/product";

export async function getPublicProducts(): Promise<Product[]> {
  const response = await apiClient.get<ApiSuccess<Paginated<Product>> | ApiSuccess<Product[]>>("/public/products/");
  const data = response.data.data;
  return Array.isArray(data) ? data : data.results;
}

export async function getPublicProduct(slug: string): Promise<Product> {
  const response = await apiClient.get<ApiSuccess<Product>>(`/public/products/${slug}/`);
  return response.data.data;
}

export async function getProducts(): Promise<Paginated<Product>> {
  const response = await apiClient.get<ApiSuccess<Paginated<Product>>>("/products/");
  return response.data.data;
}
