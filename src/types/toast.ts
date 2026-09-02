// types/toast.ts

export type ToastType = "info" | "success" | "warning" | "error";

export type ToastPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "bottom-center";

export interface ToastData {
  id: number;
  message: string;
  type: ToastType;
  icon?: React.ReactNode;
  position: ToastPosition;
  duration: number;
}

export interface ToastOptions {
  type?: ToastType;
  icon?: React.ReactNode;
  position?: ToastPosition;
  duration?: number;
}

export interface ToastGlobals {
  listeners: Array<(toast: ToastData) => void>;
  id: number;
}
