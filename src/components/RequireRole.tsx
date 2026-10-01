import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/features/auth/AuthContext";
import { hasAnyRole, homePathFor } from "@/lib/roles";
import type { UserRole } from "@/types/auth";

/** Renders child routes only for users holding one of `roles`; others go to their home page. */
export default function RequireRole({ roles }: { roles: UserRole[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!hasAnyRole(user, roles)) return <Navigate to={homePathFor(user)} replace />;
  return <Outlet />;
}
