import Image, { StaticImageData } from "next/image";

interface PlayerCardProps {
  name: string;
  status: boolean;
  avatarUrl: StaticImageData | string;
  onKick?: () => void;
  canKick?: boolean;
  isHost?: boolean;
  isMe?: boolean;
}

export function PlayerCard({
  name,
  status,
  avatarUrl,
  onKick,
  canKick,
  isHost,
  isMe,
}: PlayerCardProps) {
  return (
    <div
      className={`group relative rounded-2xl border p-4 pt-8 flex flex-col items-center gap-2.5 text-center transition-all duration-200 ${
        isHost
          ? "border-[rgba(200,169,110,0.35)] bg-gradient-to-b from-[rgba(200,169,110,0.08)] to-transparent"
          : status
            ? "border-[rgba(52,211,153,0.25)] bg-gradient-to-b from-[rgba(52,211,153,0.06)] to-transparent"
            : "border-[rgba(200,169,110,0.1)] bg-black/20"
      } ${isMe ? "ring-1 ring-[rgba(200,169,110,0.4)] ring-offset-2 ring-offset-[#120d1a]" : ""}`}
    >
      {/* Host badge */}
      {isHost && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full border border-[rgba(200,169,110,0.4)] bg-[#1a1208] px-2.5 py-0.5 text-[10px] font-cinzel tracking-wider text-[#c8a96e] whitespace-nowrap">
          ✦ Host
        </span>
      )}

      {/* Kick button */}
      {canKick && (
        <button
          type="button"
          onClick={onKick}
          title="Kick player"
          className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-lg border border-[rgba(239,68,68,0.2)] bg-black/30 text-[#f87171]/50 opacity-0 transition-all duration-150 hover:border-[rgba(239,68,68,0.4)] hover:bg-[rgba(239,68,68,0.1)] hover:text-[#f87171] group-hover:opacity-100 cursor-pointer"
        >
          <svg
            viewBox="0 0 12 12"
            width="10"
            height="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M2 2l8 8M10 2l-8 8" />
          </svg>
        </button>
      )}

      {/* Avatar */}
      <div
        className="relative w-16 h-16 rounded-full overflow-hidden border-2"
        style={{
          borderColor: isHost
            ? "rgba(200,169,110,0.5)"
            : status
              ? "rgba(52,211,153,0.4)"
              : "rgba(200,169,110,0.15)",
        }}
      >
        <Image
          src={avatarUrl}
          alt={`${name} character`}
          fill
          className="object-cover"
        />
      </div>

      {/* Name */}
      <p className="text-[13px] font-cinzel tracking-wide text-[#e8d5a3] truncate w-full">
        {name}
      </p>

      {/* Status pill */}
      {!isHost && (
        <span
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-cinzel tracking-wider ${
            status
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
              : "border-amber-400/20 bg-amber-400/10 text-amber-400"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${status ? "bg-emerald-400" : "bg-amber-400"}`}
          />
          {status ? "Ready" : "Preparing"}
        </span>
      )}
    </div>
  );
}
