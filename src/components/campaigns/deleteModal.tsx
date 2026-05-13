import type { Campaign } from "@/types/campaigns";

export default function DeleteModal({
  campaign,
  onClose,
  onConfirm,
}: {
  campaign: Campaign;
  onClose: () => void;
  onConfirm: () => void;
}) {
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
          maxWidth: "380px",
          borderRadius: "20px",
          background: "linear-gradient(160deg,#1a1208,#120d1a)",
          border: "1px solid rgba(239,68,68,0.3)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "1px",
            background:
              "linear-gradient(90deg,transparent,rgba(239,68,68,0.6),transparent)",
          }}
        />
        <div
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <h2
            style={{
              fontFamily: "'Cinzel',serif",
              color: "#e8d5a3",
              fontSize: "18px",
              margin: 0,
            }}
          >
            Delete Campaign?
          </h2>
          <p
            style={{
              fontFamily: "Georgia,serif",
              color: "#7a6548",
              fontStyle: "italic",
              fontSize: "13px",
              lineHeight: 1.75,
              margin: 0,
            }}
          >
            <span style={{ color: "#f87171" }}>{campaign.title}</span> will be
            permanently erased from the realm. This cannot be undone.
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "12px",
                fontFamily: "'Cinzel',serif",
                fontSize: "13px",
                background: "transparent",
                border: "1px solid rgba(200,169,110,0.2)",
                color: "#8a6f3e",
                cursor: "pointer",
              }}
            >
              Keep It
            </button>
            <button
              onClick={onConfirm}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "12px",
                fontFamily: "'Cinzel',serif",
                fontSize: "13px",
                background: "rgba(153,27,27,0.3)",
                border: "1px solid rgba(239,68,68,0.4)",
                color: "#f87171",
                cursor: "pointer",
              }}
            >
              Destroy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
