import { apiClient } from "@/lib/api/client";
import type { CurrentUser, Role, UserRole } from "@/types/auth";
import type { ApiSuccess, Paginated } from "@/types/common";

export async function getUsers(params: Record<string, string> = {}): Promise<Paginated<CurrentUser>> {
  const response = await apiClient.get<ApiSuccess<Paginated<CurrentUser>>>("/users/", { params });
  return response.data.data;
}

export async function getRoles(): Promise<Role[]> {
  const response = await apiClient.get<ApiSuccess<Role[]>>("/roles/");
  return response.data.data;
}

export async function createUser(payload: {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  password: string;
  roles: UserRole[];
}): Promise<CurrentUser> {
  const response = await apiClient.post<ApiSuccess<CurrentUser>>("/users/", payload);
  return response.data.data;
}

export async function setUserRoles(id: string, roles: UserRole[]): Promise<CurrentUser> {
  const response = await apiClient.post<ApiSuccess<CurrentUser>>(`/users/${id}/roles/`, { roles });
  return response.data.data;
}

export interface AssignableUser {
  id: string;
  full_name: string;
  email: string;
}

export async function getAssignableUsers(): Promise<AssignableUser[]> {
  const response = await apiClient.get<ApiSuccess<AssignableUser[]>>("/users/assignable/");
  return response.data.data;
}

export async function setUserActive(id: string, is_active: boolean): Promise<CurrentUser> {
  const response = await apiClient.patch<ApiSuccess<CurrentUser>>(`/users/${id}/`, { is_active });
  return response.data.data;
}
