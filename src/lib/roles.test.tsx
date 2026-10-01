import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import RequireRole from "@/components/RequireRole";
import { CRM_ROLES, hasAnyRole, homePathFor } from "@/lib/roles";
import type { UserRole } from "@/types/auth";

const mockUser: { current: { roles: UserRole[] } | null } = { current: null };

vi.mock("@/features/auth/AuthContext", () => ({
  useAuth: () => ({ user: mockUser.current, isLoading: false }),
}));

describe("role helpers", () => {
  it("sends each role to its home page", () => {
    expect(homePathFor({ roles: ["SUPER_ADMIN"] })).toBe("/dashboard");
    expect(homePathFor({ roles: ["ADMIN"] })).toBe("/dashboard");
    expect(homePathFor({ roles: ["SALES_EXECUTIVE"] })).toBe("/dashboard");
    expect(homePathFor({ roles: ["DOCTOR"] })).toBe("/doctor");
    expect(homePathFor({ roles: ["PATIENT"] })).toBe("/my-health");
  });

  it("checks role membership across multiple roles", () => {
    expect(hasAnyRole({ roles: ["PATIENT", "DOCTOR"] }, ["DOCTOR"])).toBe(true);
    expect(hasAnyRole({ roles: ["PATIENT"] }, CRM_ROLES)).toBe(false);
    expect(hasAnyRole(null, CRM_ROLES)).toBe(false);
  });
});

function renderGuarded(roles: UserRole[]) {
  mockUser.current = { roles };
  render(
    <MemoryRouter initialEntries={["/leads"]}>
      <Routes>
        <Route element={<RequireRole roles={CRM_ROLES} />}>
          <Route path="/leads" element={<p>Leads page</p>} />
        </Route>
        <Route path="/doctor" element={<p>Doctor home</p>} />
        <Route path="/my-health" element={<p>My health page</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("RequireRole", () => {
  it("renders the page for an allowed role", () => {
    renderGuarded(["SALES_MANAGER"]);
    expect(screen.getByText("Leads page")).toBeInTheDocument();
  });

  it("redirects a doctor away from CRM pages", () => {
    renderGuarded(["DOCTOR"]);
    expect(screen.getByText("Doctor home")).toBeInTheDocument();
  });

  it("redirects a patient away from CRM pages", () => {
    renderGuarded(["PATIENT"]);
    expect(screen.getByText("My health page")).toBeInTheDocument();
  });
});
