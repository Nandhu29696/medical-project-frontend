export type UserRole = "SUPER_ADMIN" | "ADMIN" | "SALES_MANAGER" | "SALES_EXECUTIVE" | "DOCTOR" | "PATIENT";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  roles: UserRole[];
}

export interface CurrentUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  /** Highest-privilege role held by the user. */
  role: UserRole;
  /** Every role held by the user (rows in the user_roles table). */
  roles: UserRole[];
  is_active: boolean;
  created_at: string;
}

export interface Role {
  id: number;
  code: UserRole;
  name: string;
  description: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}
