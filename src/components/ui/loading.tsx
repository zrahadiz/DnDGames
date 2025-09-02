// components/Loading.tsx
"use client";

import { Swords } from "lucide-react"; // optional: nice spinner icon

interface LoadingProps {
  status: boolean; // control visibility
  text?: string;
  fullscreen?: boolean;
}

export default function Loading({
  status,
  text = "Loading...",
  fullscreen = false,
}: LoadingProps) {
  if (!status) return null; // if false, don't render anything

  return (
    <div
      className={`flex flex-col items-center justify-center ${
        fullscreen ? "fixed inset-0 bg-black/40 z-50" : ""
      }`}
    >
      <Swords className="animate-spin h-10 w-10 text-blue-500 z-50" />
      <p className="mt-2 text-white">{text}</p>
    </div>
  );
}
