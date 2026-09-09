"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "admin" | "billing";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  company: string;
  title: string;
  twoFactorEnabled: boolean;
  lastLogin: string;
}

export interface StoredUserAccount extends AuthUser {
  passwordHash: string;
}

export type PermissionAction =
  | "view_invoices"
  | "create_invoice"
  | "delete_invoice"
  | "export_data"
  | "manage_subscriptions"
  | "manage_team"
  | "edit_billing_settings";

interface SignupData {
  name: string;
  email: string;
  company: string;
  role: UserRole;
  password?: string;
  title?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasAccounts: boolean;
  login: (email: string, password?: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (action: PermissionAction) => boolean;
  enableTwoFactor: () => void;
  disableTwoFactor: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  admin: [
    "view_invoices",
    "create_invoice",
    "delete_invoice",
    "export_data",
    "manage_subscriptions",
    "manage_team",
    "edit_billing_settings",
  ],
  billing: [
    "export_data",
    "manage_subscriptions",
    "edit_billing_settings",
  ],
};

const SESSION_KEY = "calyx_auth_session";
const ACCOUNTS_KEY = "calyx_registered_accounts";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccounts, setHasAccounts] = useState(false);

  // Check persisted session and registered accounts on mount
  useEffect(() => {
    try {
      // Check if accounts have been created
      const storedAccounts = localStorage.getItem(ACCOUNTS_KEY);
      if (storedAccounts) {
        const accounts = JSON.parse(storedAccounts);
        setHasAccounts(Array.isArray(accounts) && accounts.length > 0);
      } else {
        setHasAccounts(false);
      }

      // Restore active session if present (never auto-create fake persona)
      const savedSession = localStorage.getItem(SESSION_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed.user && parsed.token && !parsed.loggedOut) {
          setUser(parsed.user);
          setToken(parsed.token);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSession = (newUser: AuthUser, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    try {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ user: newUser, token: newToken })
      );
    } catch {
      // ignore
    }
  };

  const login = async (
    email: string,
    password?: string,
    rememberMe = true
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 500));

    const cleanEmail = email.trim().toLowerCase();
    let accounts: StoredUserAccount[] = [];

    try {
      const stored = localStorage.getItem(ACCOUNTS_KEY);
      if (stored) {
        accounts = JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    if (!accounts || accounts.length === 0) {
      setIsLoading(false);
      return {
        success: false,
        error: "No registered accounts found yet. Please create an Admin or Billing account first.",
      };
    }

    const matched = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
    if (!matched) {
      setIsLoading(false);
      return {
        success: false,
        error: `No account registered with email "${cleanEmail}". Please check your email or sign up.`,
      };
    }

    // Verify password if one was set during signup
    if (matched.passwordHash && password && matched.passwordHash !== password) {
      setIsLoading(false);
      return {
        success: false,
        error: "Incorrect password. Please try again.",
      };
    }

    const authUser: AuthUser = {
      id: matched.id,
      name: matched.name,
      email: matched.email,
      role: matched.role,
      avatar: matched.avatar,
      company: matched.company,
      title: matched.title,
      twoFactorEnabled: matched.twoFactorEnabled,
      lastLogin: "Just now",
    };

    const mockToken = `calyx_jwt_${Date.now()}`;
    if (rememberMe) {
      saveSession(authUser, mockToken);
    } else {
      setUser(authUser);
      setToken(mockToken);
    }

    setIsLoading(false);
    return { success: true };
  };

  const signup = async (data: SignupData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 500));

    const cleanEmail = data.email.trim().toLowerCase();
    let accounts: StoredUserAccount[] = [];

    try {
      const stored = localStorage.getItem(ACCOUNTS_KEY);
      if (stored) {
        accounts = JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    if (accounts.some((a) => a.email.toLowerCase() === cleanEmail)) {
      setIsLoading(false);
      return {
        success: false,
        error: `An account with email "${cleanEmail}" already exists. Please log in instead.`,
      };
    }

    const initials =
      data.name
        .trim()
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "CX";

    const newAccount: StoredUserAccount = {
      id: `usr-${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      role: data.role,
      avatar: initials,
      company: data.company.trim() || "My Organization",
      title:
        data.title ||
        (data.role === "admin" ? "Workspace Administrator" : "Billing Officer"),
      twoFactorEnabled: false,
      lastLogin: "Just now",
      passwordHash: data.password || "",
    };

    const updatedAccounts = [...accounts, newAccount];
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updatedAccounts));
      setHasAccounts(true);
    } catch {
      // ignore
    }

    const authUser: AuthUser = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      role: newAccount.role,
      avatar: newAccount.avatar,
      company: newAccount.company,
      title: newAccount.title,
      twoFactorEnabled: false,
      lastLogin: "Just now",
    };

    const mockToken = `calyx_jwt_${Date.now()}`;
    saveSession(authUser, mockToken);
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ loggedOut: true }));
    } catch {
      // ignore
    }
  };

  const enableTwoFactor = () => {
    if (!user) return;
    const updated = { ...user, twoFactorEnabled: true };
    setUser(updated);
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ user: updated, token }));
    } catch {
      // ignore
    }
  };

  const disableTwoFactor = () => {
    if (!user) return;
    const updated = { ...user, twoFactorEnabled: false };
    setUser(updated);
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ user: updated, token }));
    } catch {
      // ignore
    }
  };

  const hasPermission = (action: PermissionAction): boolean => {
    if (!user) return false;
    const allowed = ROLE_PERMISSIONS[user.role] || [];
    return allowed.includes(action);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        hasAccounts,
        login,
        signup,
        logout,
        hasPermission,
        enableTwoFactor,
        disableTwoFactor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
