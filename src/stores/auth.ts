import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

/**
 * Auth mock: user + token lưu localStorage để reload trang vẫn còn phiên.
 * Không có backend thật — mọi kiểm tra quyền chỉ là guard ở client.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: "amazing-auth" },
  ),
);

export function useIsAdmin(): boolean {
  return useAuthStore((s) => s.user?.role === "admin");
}
