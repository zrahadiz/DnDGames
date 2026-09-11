import { io, Socket } from "socket.io-client";

const URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001";

const socket: Socket =
  (globalThis as any).socket ||
  io(URL, {
    autoConnect: false,
    transports: ["polling", "websocket"],
    withCredentials: true,
  });

if (process.env.NODE_ENV === "development") {
  (globalThis as any).socket = socket;
}

export { socket };
