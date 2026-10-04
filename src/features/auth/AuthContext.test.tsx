import { describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider, useAuth } from "@/features/auth/AuthContext";

vi.mock("@/lib/api/auth", () => ({
  login: vi.fn().mockResolvedValue({ access: "a.e30.b", refresh: "r" }),
  logout: vi.fn().mockResolvedValue(undefined),
  getMe: vi.fn().mockResolvedValue({ id: "u2", full_name: "Second User", roles: ["PATIENT"], role: "PATIENT" }),
}));

function Grab({ onReady }: { onReady: (auth: ReturnType<typeof useAuth>) => void }) {
  onReady(useAuth());
  return null;
}

describe("AuthProvider", () => {
  it("clears every cached query on sign-in and sign-out, so no user sees another's data", async () => {
    const client = new QueryClient();
    let auth!: ReturnType<typeof useAuth>;
    render(
      <QueryClientProvider client={client}>
        <AuthProvider>
          <Grab onReady={(a) => (auth = a)} />
        </AuthProvider>
      </QueryClientProvider>
    );

    client.setQueryData(["notifications", "u1", "latest"], { results: [{ id: "n1", title: "For the first user" }] });
    await act(() => auth.login("second@example.com", "pw"));
    expect(client.getQueryData(["notifications", "u1", "latest"])).toBeUndefined();

    client.setQueryData(["patients"], { results: [1, 2, 3] });
    await act(() => auth.logout());
    expect(client.getQueryData(["patients"])).toBeUndefined();
  });
});
