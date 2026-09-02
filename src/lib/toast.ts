import type { ToastData, ToastOptions, ToastGlobals } from "@/types/toast";

// Extend Window interface
declare global {
  interface Window {
    __TOAST_GLOBALS__?: ToastGlobals;
  }
}

// Global singleton state (persists across hot reloads)
if (typeof window !== "undefined" && !window.__TOAST_GLOBALS__) {
  window.__TOAST_GLOBALS__ = {
    listeners: [],
    id: 0,
  };
}

const getGlobals = (): ToastGlobals => window.__TOAST_GLOBALS__!;

// 🚀 Export the global toast function
export const toast = (message: string, options: ToastOptions = {}): void => {
  const globals = getGlobals();

  const toastData: ToastData = {
    id: ++globals.id,
    message,
    type: options.type || "info",
    icon: options.icon || null,
    position: options.position || "top-right",
    duration: options.duration || 3000,
  };

  globals.listeners.forEach((cb) => cb(toastData));
};

// Helper (used by the component internally)
export const toastSubscribe = (
  callback: (toast: ToastData) => void,
): (() => void) => {
  const globals = getGlobals();

  globals.listeners.push(callback);

  return () => {
    globals.listeners = globals.listeners.filter((fn) => fn !== callback);
  };
};
