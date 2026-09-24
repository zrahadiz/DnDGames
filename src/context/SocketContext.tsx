"use client";
import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { socket } from "@/lib/socket-client";
import { ApiResponse } from "@/types/apiResponse";
import api from "@/lib/axios";
import axios from "axios";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { useAuthStore } from "@/stores/auth-store";

type SocketContextType = typeof socket;

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isFetched = useAuthStore((state) => state.isFetched);

  useEffect(() => {
    if (!isFetched || isLoading) return;

    if (!user) {
      socket.disconnect();
      return;
    }

    let cancelled = false;

    const connectSocket = async () => {
      try {
        const { data } =
          await api.get<ApiResponse<{ token: string }>>("/socket-token");

        // console.log("socket token result:", data);
        if (cancelled) return;

        if (!data.success || !data.data?.token) {
          throw new Error(data.message ?? "Failed to authenticate socket");
        }

        socket.auth = {
          token: data.data.token,
        };

        if (!socket.connected) {
          socket.connect();
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;

          // No active session — don't show an error
          if (status === 401) {
            return;
          }

          // User should know they're being rate limited
          if (status === 429) {
            toast(getErrorMessage(error), {
              type: "error",
            });
            return;
          }
        }

        console.error("Socket connection failed:", error);
      }
    };

    connectSocket();
    return () => {
      cancelled = true;
    };
  }, [user?.id, isFetched, isLoading]);

  useEffect(() => {
    const onConnect = () => {
      console.log("✅ Connected");
    };

    const onDisconnect = () => {
      console.log("❌ Disconnected");
    };

    const onConnectError = (error: Error) => {
      console.error("❌ Socket error:", error.message);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used inside SocketProvider");
  return ctx;
}
