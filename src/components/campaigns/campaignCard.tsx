import { useState } from "react";

import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { CampaignWithRelation } from "@/types/campaigns";

type Props = {
  campaign: CampaignWithRelation;

  isOwner: boolean;

  onEdit: (c: CampaignWithRelation) => void;

  onDelete: (c: CampaignWithRelation) => void;

  onPlay: (c: CampaignWithRelation) => void;
};

export default function CampaignCard({
  campaign,
  isOwner,
  onEdit,
  onDelete,
  onPlay,
}: Props) {
  const Icon =
    (LucideIcons[
      campaign.theme.icon as keyof typeof LucideIcons
    ] as LucideIcon) || LucideIcons.Circle;

  const [hovered, setHovered] = useState(false);

  function formatWorldSetupKey(key: string) {
    return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
  }
  return (
    <div
      className={`
      flex flex-col overflow-hidden rounded-2xl border
      bg-[linear-gradient(160deg,#1a1208,#120d1a)]
      transition-all duration-200
      ${
        hovered
          ? "translate-y-[-4px] border-[rgba(200,169,110,0.45)] shadow-[0_16px_40px_rgba(0,0,0,0.4)]"
          : "border-[rgba(200,169,110,0.15)]"
      }
    `}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`h-[6px] ${
          campaign.isOfficial
            ? "bg-[linear-gradient(90deg,rgba(200,169,110,0.7),rgba(124,58,237,0.5))]"
            : "bg-[linear-gradient(90deg,rgba(167,139,250,0.5),rgba(45,212,191,0.3))]"
        }`}
      />

      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Icon className="h-4 w-4 text-yellow-600" />

            <span
              className="
              rounded-full border border-[rgba(200,169,110,0.2)]
              bg-[rgba(200,169,110,0.1)]
              px-2.5 py-[3px]
              font-['Cinzel']
              text-[11px]
              tracking-[0.08em]
              text-[#8a6f3e]
            "
            >
              {campaign.theme.name}
            </span>

            {campaign.isOfficial && (
              <span
                className="
                rounded-full border border-[rgba(200,169,110,0.28)]
                bg-[rgba(200,169,110,0.12)]
                px-2 py-[2px]
                font-serif text-[11px] italic text-[#c8a96e]
              "
              >
                ✦ Official
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3
          className="
          m-0
          font-['Cinzel']
          text-[15px]
          tracking-[0.04em]
          text-[#e8d5a3]
        "
        >
          {campaign.title}
        </h3>

        {/* Description */}
        <p
          className="
          m-0 flex-1
          font-serif text-[13px]
          italic leading-[1.75]
          text-[#7a6548]
          line-clamp-4
        "
        >
          {campaign.description}
        </p>

        {/* World Setup */}
        <div className="rounded-[10px] border border-[rgba(200,169,110,0.08)] bg-[rgba(0,0,0,0.2)] p-3">
          {campaign.worldSetup &&
            Object.entries(campaign.worldSetup).map(([key, value]) => (
              <div key={key} className="grid grid-cols-2 gap-2">
                <span className="font-serif text-[#5a4830]">
                  {formatWorldSetupKey(key)}
                </span>

                <span className="truncate font-serif text-[#8a6f3e]">
                  {String(value)}
                </span>
              </div>
            ))}
        </div>

        {/* Objective */}
        <div
          className="
          rounded-[10px]
          border border-[rgba(167,139,250,0.12)]
          bg-[rgba(124,58,237,0.07)]
          px-3 py-2.5
        "
        >
          <p className="m-0 font-serif text-xs italic text-[#9a85c4] line-clamp-2">
            <span className="text-[#6a5490]">Objective:</span>
            {campaign.startingObjective}
          </p>
        </div>

        {/* Footer */}
        <div
          className="
          flex items-center justify-between
          border-t border-[rgba(200,169,110,0.1)]
          pt-2.5
        "
        >
          <div>
            <div className="font-serif text-xs text-[#5a4830]">
              by {campaign.creator.name}
            </div>

            {/* Rating */}
            {/* {campaign.rating && (
            <div className="font-serif text-xs text-[#c8a96e]">
              ★ {campaign.rating} ·{" "}
              {campaign.playerCount?.toLocaleString()} plays
            </div>
          )} */}
          </div>

          <div className="flex items-center gap-2">
            {isOwner && (
              <>
                {/* Edit */}
                <button
                  onClick={() => onEdit(campaign)}
                  title="Edit"
                  className="
                  rounded-lg border border-[rgba(200,169,110,0.22)]
                  bg-transparent p-1.5
                  text-[#8a6f3e]
                  transition hover:bg-[rgba(200,169,110,0.08)] cursor-pointer
                "
                >
                  <svg
                    viewBox="0 0 16 16"
                    width="13"
                    height="13"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <path d="M11 2l3 3-8 8H3v-3l8-8z" />
                  </svg>
                </button>

                {/* Delete */}
                <button
                  onClick={() => onDelete(campaign)}
                  title="Delete"
                  className="
                  rounded-lg border border-[rgba(239,68,68,0.22)]
                  bg-transparent p-1.5
                  text-[#f87171]
                  transition hover:bg-[rgba(239,68,68,0.08)] cursor-pointer
                "
                >
                  <svg
                    viewBox="0 0 16 16"
                    width="13"
                    height="13"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" />
                  </svg>
                </button>
              </>
            )}

            {/* Play */}
            <button
              onClick={() => onPlay(campaign)}
              className="
              rounded-[10px]
              border border-[rgba(200,169,110,0.35)]
              bg-[linear-gradient(135deg,#2a1f0a,#1e1808)]
              px-3.5 py-[7px]
              font-['Cinzel']
              text-xs tracking-[0.05em]
              text-[#d4b87a]
              transition
              hover:brightness-110
              active:scale-[0.98]
              cursor-pointer
            "
            >
              Play
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
