"use client";
import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { socket } from "@/lib/socket";

type SocketContextType = typeof socket;

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.on("connect", () => console.log("✅ Connected:", socket.id));
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
