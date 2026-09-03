type ConfirmationModalProps = {
  title: string;
  description: React.ReactNode;
  cancelLabel?: string;
  confirmLabel?: string;
  variant?: "default" | "danger";
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
};

export default function ConfirmationModal({
  title,
  description,
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  variant = "default",
  onClose,
  onConfirm,
  isLoading = false,
}: ConfirmationModalProps) {
  const isDanger = variant === "danger";

  return (
    <div
      onClick={isLoading ? undefined : onClose}
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
          border: isDanger
            ? "1px solid rgba(239,68,68,0.3)"
            : "1px solid rgba(200,169,110,0.25)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "1px",
            background: isDanger
              ? "linear-gradient(90deg,transparent,rgba(239,68,68,0.6),transparent)"
              : "linear-gradient(90deg,transparent,rgba(200,169,110,0.5),transparent)",
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
            {title}
          </h2>

          <div
            style={{
              fontFamily: "Georgia,serif",
              color: "#7a6548",
              fontStyle: "italic",
              fontSize: "13px",
              lineHeight: 1.75,
            }}
          >
            {description}
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <button
              type="button"
              disabled={isLoading}
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
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              {cancelLabel}
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "12px",
                fontFamily: "'Cinzel',serif",
                fontSize: "13px",
                background: isDanger
                  ? "rgba(153,27,27,0.3)"
                  : "rgba(120,90,40,0.25)",
                border: isDanger
                  ? "1px solid rgba(239,68,68,0.4)"
                  : "1px solid rgba(200,169,110,0.35)",
                color: isDanger ? "#f87171" : "#d8b56c",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? "Processing..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
