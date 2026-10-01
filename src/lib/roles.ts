import type { UserRole } from "@/types/auth";

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  SALES_MANAGER: "Sales Manager",
  SALES_EXECUTIVE: "Sales Executive",
  DOCTOR: "Doctor",
  PATIENT: "Patient",
};

export const ALL_ROLES = Object.keys(ROLE_LABELS) as UserRole[];

export const ADMIN_ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN"];
export const MANAGER_ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN", "SALES_MANAGER"];
export const CRM_ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN", "SALES_MANAGER", "SALES_EXECUTIVE"];
export const CLINICAL_STAFF_ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN", "DOCTOR"];

export function hasAnyRole(user: { roles: UserRole[] } | null | undefined, allowed: UserRole[]): boolean {
  return !!user && user.roles.some((role) => allowed.includes(role));
}

/** Where each role lands after signing in. */
export function homePathFor(user: { roles: UserRole[] }): string {
  if (hasAnyRole(user, CRM_ROLES)) return "/dashboard";
  if (hasAnyRole(user, ["DOCTOR"])) return "/doctor";
  if (hasAnyRole(user, ["PATIENT"])) return "/my-health";
  return "/doctors";
}
