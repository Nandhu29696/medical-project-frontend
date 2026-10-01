import { apiClient } from "@/lib/api/client";
import type { ApiSuccess } from "@/types/common";
import type { CurrentUser, LoginResponse } from "@/types/auth";

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/login/", { email, password });
  return response.data;
}

export async function logout(refresh: string): Promise<void> {
  await apiClient.post("/auth/logout/", { refresh });
}

export async function getMe(): Promise<CurrentUser> {
  const response = await apiClient.get<ApiSuccess<CurrentUser>>("/auth/me/");
  return response.data.data;
}

export async function updateMe(
  payload: Partial<Pick<CurrentUser, "first_name" | "last_name" | "phone">>
): Promise<CurrentUser> {
  const response = await apiClient.patch<ApiSuccess<CurrentUser>>("/auth/me/", payload);
  return response.data.data;
}

export async function changePassword(current_password: string, new_password: string): Promise<void> {
  await apiClient.post("/auth/change-password/", { current_password, new_password });
}

export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth?: string | null;
  gender: string;
  city: string;
  consent_given: boolean;
  whatsapp_opt_in?: boolean;
}

export async function registerPatient(payload: RegisterPayload): Promise<CurrentUser> {
  const response = await apiClient.post<ApiSuccess<CurrentUser>>("/auth/register/", payload);
  return response.data.data;
}
