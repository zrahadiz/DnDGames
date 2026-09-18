import { create } from "zustand";

import type { Users } from "@/types/users";
import api from "@/lib/axios";
import { authClient } from "@/lib/auth-client";
import axios from "axios";

type AuthType = "guest" | "registered" | null;

type AuthStore = {
  user: Users | null;
  authType: AuthType;

  isLoading: boolean;
  isFetched: boolean;

  fetchUser: () => Promise<void>;
  setUser: (user: Users | null) => void;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  authType: null,

  isLoading: false,
  isFetched: false,

  fetchUser: async () => {
    set({
      isLoading: true,
    });
    try {
      const { data } = await api.get("/auth/me");
      // console.log("userStore: ", data);
      // console.log("userStore2: ", data?.data.user || null);

      set({
        user: data?.data?.user ?? null,
        authType: data?.data?.type ?? null,
      });
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 401) {
        console.error("Failed to fetch user:", error);
      }

      set({
        user: null,
        authType: null,
      });
    } finally {
      set({
        isLoading: false,
        isFetched: true,
      });
    }
  },

  setUser: (user) => {
    set({
      user,
      isFetched: true,
    });
  },

  logout: async () => {
    const { authType } = get();

    try {
      if (authType === "guest") {
        await api.post("/auth/guest/logout");
      } else if (authType === "registered") {
        await authClient.signOut();
      }

      set({
        user: null,
        authType: null,
        isFetched: true,
      });
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  },
}));
