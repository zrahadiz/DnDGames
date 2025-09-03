import { Card, CardContent } from "@/components/ui/card";
import Image, { StaticImageData } from "next/image";
import { Button } from "@/components/ui/button";

interface PlayerCardProps {
  name: string;
  status: "Waiting" | "Ready" | "Playing";
  avatarUrl: StaticImageData | string;
}

export function PlayerCard({ name, status, avatarUrl }: PlayerCardProps) {
  const statusColor =
    status === "Ready"
      ? "bg-green-500"
      : status === "Playing"
      ? "bg-blue-500"
      : "bg-gray-400"; // Waiting

  return (
    <div className="relative col-span-1 h-36 justify-center items-center">
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-tr from-slate-500 to-slate-800 rounded-xl h-3/4"></div>

      <div className="absolute inset-x-0 top-0 flex justify-center">
        <Image
          src={avatarUrl}
          alt={`${name} character`}
          width={100}
          height={100}
          className="relative z-10"
        />
      </div>

      <div className="text-center z-20 relative mt-20 space-y-1">
        <p className="text-white text-lg font-bold drop-shadow-md truncate">
          {name}
        </p>
        <span
          className={`text-xs px-2 py-1 rounded-full text-white ${statusColor}`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}
