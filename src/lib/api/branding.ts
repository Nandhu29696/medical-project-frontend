import { apiClient } from "@/lib/api/client";
import type { SiteTheme } from "@/lib/branding";
import type { ApiSuccess } from "@/types/common";

export type ThemeSettings = SiteTheme & {
  presets: Record<string, Omit<SiteTheme, "preset">>;
};

export async function getPublicTheme(): Promise<SiteTheme> {
  const response = await apiClient.get<ApiSuccess<SiteTheme>>("/public/theme/");
  return response.data.data;
}

export async function getThemeSettings(): Promise<ThemeSettings> {
  const response = await apiClient.get<ApiSuccess<ThemeSettings>>("/theme/");
  return response.data.data;
}

export async function saveThemeSettings(payload: Partial<SiteTheme>): Promise<ThemeSettings> {
  const response = await apiClient.patch<ApiSuccess<ThemeSettings>>("/theme/", payload);
  return response.data.data;
}

export async function resetThemeSettings(): Promise<ThemeSettings> {
  const response = await apiClient.delete<ApiSuccess<ThemeSettings>>("/theme/");
  return response.data.data;
}
