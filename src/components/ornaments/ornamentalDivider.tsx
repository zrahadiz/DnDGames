// ── Shared SVG decorations ──────────────────────────────────────────────────
export default function OrnamentalDivider({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="flex-1 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(200,169,110,0.3))",
        }}
      />
      <svg viewBox="0 0 48 16" width="48" height="16" aria-hidden="true">
        <polygon
          points="0,8 8,2 16,8 8,14"
          fill="none"
          stroke="rgba(200,169,110,0.5)"
          strokeWidth="0.75"
        />
        <circle cx="24" cy="8" r="2.5" fill="rgba(200,169,110,0.6)" />
        <polygon
          points="32,8 40,2 48,8 40,14"
          fill="none"
          stroke="rgba(200,169,110,0.5)"
          strokeWidth="0.75"
        />
      </svg>
      <div
        className="flex-1 h-px"
        style={{
          background:
            "linear-gradient(90deg, rgba(200,169,110,0.3), transparent)",
        }}
      />
    </div>
  );
}
