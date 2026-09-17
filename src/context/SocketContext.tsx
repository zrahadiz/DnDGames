"use client";
import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { socket } from "@/lib/socket-client";
import { ApiResponse } from "@/types/apiResponse";
import api from "@/lib/axios";
import axios from "axios";

type SocketContextType = typeof socket;

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const connectSocket = async () => {
      try {
        const { data } =
          await api.get<ApiResponse<{ token: string }>>("/socket-token");

        // console.log("socket token result:", data);

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
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        }

        console.error("Socket connection failed:", error);
      }
    };

    connectSocket();

    const onConnect = () => {
      console.log("✅ Connected:", socket.id);
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
