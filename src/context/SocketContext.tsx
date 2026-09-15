"use client";
import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { socket } from "@/lib/socket-client";
import { ApiResponse } from "@/types/apiResponse";

type SocketContextType = typeof socket;

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const connectSocket = async () => {
      try {
        const response = await fetch("/api/socket-token");
        console.log("socket token resp: ", response);

        if (response.status === 401) {
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to authenticate socket: ${response.status}`);
        }

        const result: ApiResponse<{ token: string }> = await response.json();
        console.log("socket token result: ", result);

        if (!result.success || !result.data?.token) {
          throw new Error(result.message ?? "Failed to authenticate socket");
        }

        socket.auth = {
          token: result.data.token,
        };

        if (!socket.connected) {
          socket.connect();
        }
      } catch (error) {
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
