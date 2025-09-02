// lib/socket.ts
import { io, Socket } from "socket.io-client";

const URL = "http://localhost:3001";

const socket: Socket =
  (globalThis as any).socket ||
  io(URL, {
    autoConnect: false,
    transports: ["websocket"],
  });

if (process.env.NODE_ENV === "development") {
  (globalThis as any).socket = socket;
}

export { socket };
