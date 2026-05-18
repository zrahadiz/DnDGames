import { useState } from "react";

import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { Campaign } from "@/types/campaigns";

type Props = {
  campaign: Campaign;

  isOwner: boolean;

  onEdit: (c: Campaign) => void;

  onDelete: (c: Campaign) => void;

  onPlay: (c: Campaign) => void;
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

  const s: React.CSSProperties = {
    background: "linear-gradient(160deg,#1a1208,#120d1a)",
    border: `1px solid ${hovered ? "rgba(200,169,110,0.45)" : "rgba(200,169,110,0.15)"}`,
    borderRadius: "16px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.25s",
    transform: hovered ? "translateY(-4px)" : "none",
    boxShadow: hovered ? "0 16px 40px rgba(0,0,0,0.4)" : "none",
  };

  function formatWorldSetupKey(key: string) {
    return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
  }
  return (
    <div
      style={s}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          height: "6px",
          background: campaign.isOfficial
            ? "linear-gradient(90deg,rgba(200,169,110,0.7),rgba(124,58,237,0.5))"
            : "linear-gradient(90deg,rgba(167,139,250,0.5),rgba(45,212,191,0.3))",
        }}
      />
      <div
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              alignItems: "center",
            }}
          >
            <Icon className="h-4 w-4 text-yellow-600" />
            <span
              style={{
                fontSize: "11px",
                padding: "3px 10px",
                borderRadius: "999px",
                fontFamily: "'Cinzel',serif",
                background: "rgba(200,169,110,0.1)",
                border: "1px solid rgba(200,169,110,0.2)",
                color: "#8a6f3e",
                letterSpacing: "0.08em",
              }}
            >
              {campaign.theme.name}
            </span>
            {campaign.isOfficial && (
              <span
                style={{
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  background: "rgba(200,169,110,0.12)",
                  border: "1px solid rgba(200,169,110,0.28)",
                  color: "#c8a96e",
                  fontFamily: "serif",
                  fontStyle: "italic",
                }}
              >
                ✦ Official
              </span>
            )}
          </div>
        </div>
        <h3
          style={{
            fontFamily: "'Cinzel',serif",
            color: "#e8d5a3",
            fontSize: "15px",
            letterSpacing: "0.04em",
            margin: 0,
          }}
        >
          {campaign.title}
        </h3>
        <p
          style={{
            fontFamily: "Georgia,serif",
            color: "#7a6548",
            fontStyle: "italic",
            fontSize: "13px",
            lineHeight: 1.75,
            margin: 0,
            flex: 1,
          }}
        >
          {campaign.description}
        </p>
        <div className="rounded-[10px] border border-[rgba(200,169,110,0.08)] bg-[rgba(0,0,0,0.2)] p-3">
          {campaign.worldSetup &&
            Object.entries(campaign.worldSetup).map(([key, value]) => (
              <div key={key} className="grid grid-cols-2 gap-2">
                <span className="font-serif text-[#5a4830]">
                  {formatWorldSetupKey(key)}
                </span>

                <span className="font-serif truncate text-ellipsis text-[#8a6f3e]">
                  {String(value)}
                </span>
              </div>
            ))}
        </div>
        <div
          style={{
            background: "rgba(124,58,237,0.07)",
            border: "1px solid rgba(167,139,250,0.12)",
            borderRadius: "10px",
            padding: "10px 12px",
          }}
        >
          <p
            style={{
              color: "#9a85c4",
              fontFamily: "Georgia,serif",
              fontStyle: "italic",
              fontSize: "12px",
              margin: 0,
            }}
          >
            <span style={{ color: "#6a5490" }}>Objective: </span>
            {campaign.startingObjective}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "10px",
            borderTop: "1px solid rgba(200,169,110,0.1)",
          }}
        >
          <div>
            <div
              style={{
                color: "#5a4830",
                fontFamily: "serif",
                fontSize: "12px",
              }}
            >
              by {campaign.creator.name}
            </div>
            {/* {campaign.rating && (
              <div
                style={{
                  color: "#c8a96e",
                  fontFamily: "serif",
                  fontSize: "12px",
                }}
              >
                ★ {campaign.rating} · {campaign.playerCount?.toLocaleString()}{" "}
                plays
              </div>
            )} */}
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {isOwner && (
              <>
                <button
                  onClick={() => onEdit(campaign)}
                  title="Edit"
                  style={{
                    padding: "6px",
                    borderRadius: "8px",
                    border: "1px solid rgba(200,169,110,0.22)",
                    background: "transparent",
                    color: "#8a6f3e",
                    cursor: "pointer",
                  }}
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
                <button
                  onClick={() => onDelete(campaign)}
                  title="Delete"
                  style={{
                    padding: "6px",
                    borderRadius: "8px",
                    border: "1px solid rgba(239,68,68,0.22)",
                    background: "transparent",
                    color: "#f87171",
                    cursor: "pointer",
                  }}
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
            <button
              onClick={() => onPlay(campaign)}
              style={{
                padding: "7px 14px",
                borderRadius: "10px",
                fontFamily: "'Cinzel',serif",
                fontSize: "12px",
                background: "linear-gradient(135deg,#2a1f0a,#1e1808)",
                border: "1px solid rgba(200,169,110,0.35)",
                color: "#d4b87a",
                cursor: "pointer",
                letterSpacing: "0.05em",
              }}
            >
              Play
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
