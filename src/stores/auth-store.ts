import { create } from "zustand";

import type { Users } from "@/types/users";
import api from "@/lib/axios";

type AuthStore = {
  user: Users | null;

  isLoading: boolean;

  isFetched: boolean;

  fetchUser: () => Promise<void>;

  setUser: (user: Users | null) => void;

  logout: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,

  isLoading: false,

  isFetched: false,

  fetchUser: async () => {
    try {
      set({
        isLoading: true,
      });

      const { data } = await api.get("/auth/me");
      console.log("userStore: ", data.user);

      set({
        user: data.user,
        isLoading: false,
        isFetched: true,
      });
    } catch (error) {
      console.error("Failed to fetch user:", error);

      set({
        user: null,
        isLoading: false,
        isFetched: true,
      });
    }
  },

  setUser: (user) => set({ user }),

  logout: () =>
    set({
      user: null,
    }),
}));
