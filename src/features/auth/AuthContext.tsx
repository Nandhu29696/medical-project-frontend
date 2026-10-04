import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { getMe, login as loginRequest, logout as logoutRequest } from "@/lib/api/auth";
import { ACCESS_TOKEN_KEY, tokenStorage } from "@/lib/api/client";
import type { CurrentUser } from "@/types/auth";

interface AuthContextValue {
  user: CurrentUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<CurrentUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** The user id inside a JWT access token (no verification — only to compare tabs). */
function tokenUserId(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return (JSON.parse(atob(payload)) as { user_id?: string }).user_id ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
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

  // Another tab signed out or signed in as someone else: never keep showing the old
  // person's data here. A token refresh for the same user is ignored.
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== ACCESS_TOKEN_KEY || !user) return;
      const nextUser = tokenUserId(event.newValue);
      if (nextUser === user.id) return;
      queryClient.clear();
      if (nextUser) {
        window.location.reload();
      } else {
        setUser(null);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [user, queryClient]);

  async function login(email: string, password: string) {
    const response = await loginRequest(email, password);
    // Drop anything cached for a previous user before the new one sees a page.
    queryClient.clear();
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
      queryClient.clear();
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
