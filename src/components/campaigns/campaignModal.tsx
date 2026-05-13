import { useState } from "react";

import GoldBar from "../ornaments/goldBar";
import type { Campaign } from "@/types/campaigns";
import Divider from "../ornaments/divider";

const THEMES = [
  "all",
  "epic-fantasy",
  "horror",
  "sci-fi",
  "intrigue",
  "steampunk",
  "fey",
  "western",
  "post-apocalyptic",
];

export default function CampaignModal({
  campaign,
  onClose,
  onSave,
}: {
  campaign?: Campaign;
  onClose: () => void;
  onSave: (d: Record<string, unknown>) => void;
}) {
  const isEdit = !!campaign;
  const [form, setForm] = useState({
    title: campaign?.title ?? "",
    description: campaign?.description ?? "",
    // theme: campaign?.theme ?? "epic-fantasy",
    backgroundLore: campaign?.backgroundLore ?? "",
    startingObjective: campaign?.startingObjective ?? "",
    isOfficial: campaign?.isOfficial ?? false,
  });
  const set =
    (k: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  const inputStyle: React.CSSProperties = {
    background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(200,169,110,0.2)",
    color: "#e8d5a3",
    fontFamily: "Georgia,serif",
    borderRadius: "10px",
    padding: "9px 12px",
    width: "100%",
    fontSize: "13px",
    outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: "'Cinzel',serif",
    color: "#8a6f3e",
    fontSize: "11px",
    letterSpacing: "0.08em",
    display: "block",
    marginBottom: "5px",
  };
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "640px",
          maxHeight: "90vh",
          overflowY: "auto",
          borderRadius: "20px",
          background: "linear-gradient(160deg,#1a1208,#0f0c06,#120d1a)",
          border: "1px solid rgba(200,169,110,0.3)",
          boxShadow: "0 0 60px rgba(0,0,0,0.6)",
        }}
      >
        <GoldBar />
        <div
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h2
              style={{
                fontFamily: "'Cinzel',serif",
                color: "#e8d5a3",
                fontSize: "20px",
                margin: 0,
              }}
            >
              {isEdit ? "Edit Campaign" : "Forge New Campaign"}
            </h2>
            <button
              onClick={onClose}
              style={{
                padding: "6px",
                borderRadius: "8px",
                border: "1px solid rgba(200,169,110,0.2)",
                background: "transparent",
                color: "#8a6f3e",
                cursor: "pointer",
              }}
            >
              <svg
                viewBox="0 0 16 16"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M2 2l12 12M14 2L2 14" />
              </svg>
            </button>
          </div>
          <Divider />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
            }}
          >
            <div style={{ gridColumn: "1/-1" }}>
              <label style={labelStyle}>Campaign Title</label>
              <input
                style={inputStyle}
                value={form.title}
                onChange={set("title")}
              />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={labelStyle}>Description</label>
              <textarea
                style={{ ...inputStyle, resize: "none" }}
                rows={3}
                value={form.description}
                onChange={set("description")}
              />
            </div>
            {/* <div>
              <label style={labelStyle}>Theme</label>
              <select
                style={{ ...inputStyle, background: "#1a1208" }}
                value={form.theme}
                onChange={set("theme")}
              >
                {THEMES.filter((t) => t !== "all").map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div> */}
            <div style={{ gridColumn: "1/-1" }}>
              <label style={labelStyle}>Background Lore</label>
              <textarea
                style={{ ...inputStyle, resize: "none" }}
                rows={3}
                value={form.backgroundLore}
                onChange={set("backgroundLore")}
              />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={labelStyle}>Starting Objective</label>
              <textarea
                style={{ ...inputStyle, resize: "none" }}
                rows={2}
                value={form.startingObjective}
                onChange={set("startingObjective")}
              />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() =>
                setForm((f) => ({ ...f, isOfficial: !f.isOfficial }))
              }
              style={{
                position: "relative",
                width: "40px",
                height: "22px",
                borderRadius: "999px",
                border: "1px solid rgba(200,169,110,0.3)",
                background: form.isOfficial
                  ? "rgba(200,169,110,0.45)"
                  : "rgba(255,255,255,0.08)",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "2px",
                  left: "2px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: "#e8d5a3",
                  transition: "transform 0.2s",
                  transform: form.isOfficial
                    ? "translateX(18px)"
                    : "translateX(0)",
                }}
              />
            </button>
            <span
              style={{
                fontFamily: "Georgia,serif",
                color: "#8a6f3e",
                fontSize: "13px",
                fontStyle: "italic",
              }}
            >
              Publish to community
            </span>
          </div>
          <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "11px",
                borderRadius: "12px",
                fontFamily: "'Cinzel',serif",
                fontSize: "13px",
                background: "transparent",
                border: "1px solid rgba(200,169,110,0.2)",
                color: "#8a6f3e",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(form)}
              style={{
                flex: 1,
                padding: "11px",
                borderRadius: "12px",
                fontFamily: "'Cinzel',serif",
                fontSize: "13px",
                fontWeight: 600,
                background: "linear-gradient(135deg,#3d2e10,#2a1f0a)",
                border: "1px solid rgba(200,169,110,0.45)",
                color: "#e8d5a3",
                cursor: "pointer",
                letterSpacing: "0.05em",
              }}
            >
              {isEdit ? "Save Changes" : "Forge Campaign"}
            </button>
          </div>
        </div>
        <GoldBar />
      </div>
    </div>
  );
}
