import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { getMe, login as loginRequest, logout as logoutRequest } from "@/lib/api/auth";
import { tokenStorage } from "@/lib/api/client";
import type { CurrentUser } from "@/types/auth";

interface AuthContextValue {
  user: CurrentUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<CurrentUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      if (tokenStorage.getAccess()) {
        try {
          const me = await getMe();
          setUser(me);
        } catch {
          tokenStorage.clear();
        }
      }
      setIsLoading(false);
    }
    void bootstrap();
  }, []);

  async function login(email: string, password: string) {
    const response = await loginRequest(email, password);
    tokenStorage.set(response.access, response.refresh);
    const me = await getMe();
    setUser(me);
    return me;
  }

  async function logout() {
    const refresh = tokenStorage.getRefresh();
    try {
      if (refresh) await logoutRequest(refresh);
    } finally {
      tokenStorage.clear();
      setUser(null);
    }
  }

  async function refreshUser() {
    setUser(await getMe());
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
