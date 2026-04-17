"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { apiFetch, setAccessToken, silentRefresh } from "./api";

interface UserAddress {
  id: string;
  type: "BILLING" | "SHIPPING";
  isDefault: boolean;
  firstName: string;
  lastName: string;
  company?: string;
  street: string;
  street2?: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  role: "USER" | "ADMIN";
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  siret?: string;
  tvaNumber?: string;
  createdAt: string;
  addresses: UserAddress[];
}

interface LoginResult {
  requireCode: boolean;
  message: string;
  user?: User | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  verifyLoginCode: (email: string, code: string) => Promise<User | null>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async (): Promise<User | null> => {
    try {
      const res = await apiFetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        return data;
      } else {
        setUser(null);
        return null;
      }
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const token = await silentRefresh();
        if (!cancelled && token) {
          await fetchUser();
        }
      } catch {
        // Not authenticated
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => { cancelled = true; };
  }, [fetchUser]);

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }
      if (data.accessToken) {
        setAccessToken(data.accessToken);
        const userData = await fetchUser();
        return { requireCode: false, message: "", user: userData };
      }
      return {
        requireCode: data.requireCode ?? false,
        message: data.message ?? "",
      };
    },
    [fetchUser],
  );

  const verifyLoginCode = useCallback(
    async (email: string, code: string): Promise<User | null> => {
      const res = await fetch("/api/auth/verify-login-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Code invalide");
      }
      const data = await res.json();
      setAccessToken(data.accessToken);
      return await fetchUser();
    },
    [fetchUser],
  );

  const register = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Registration failed");
    }
    const data = await res.json();
    if (data.accessToken) {
      setAccessToken(data.accessToken);
      await fetchUser();
    }
  }, [fetchUser]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        verifyLoginCode,
        register,
        logout,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export type { User, UserAddress };

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
