"use client";
import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { socket } from "@/lib/socket-client";

type SocketContextType = typeof socket;

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.on("connect", () => {
      const engine = socket.io.engine;

      console.log("✅ Socket connected:", socket.id);
      console.log("Initial transport:", engine.transport.name);

      engine.once("upgrade", (transport) => {
        console.log("⬆️ Transport upgraded:", transport.name);
      });
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connect error:", error.message);
      console.error(error);
    });

    socket.on("disconnect", () => console.log("❌ Disconnected"));

    return () => {
      socket.off("connect");
      socket.off("disconnect");
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
