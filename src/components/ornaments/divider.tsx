export default function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div
        style={{
          flex: 1,
          height: "1px",
          background:
            "linear-gradient(90deg,transparent,rgba(200,169,110,0.25))",
        }}
      />
      <svg viewBox="0 0 48 16" width="40" height="14">
        <polygon
          points="0,8 8,2 16,8 8,14"
          fill="none"
          stroke="rgba(200,169,110,0.45)"
          strokeWidth="0.75"
        />
        <circle cx="24" cy="8" r="2" fill="rgba(200,169,110,0.55)" />
        <polygon
          points="32,8 40,2 48,8 40,14"
          fill="none"
          stroke="rgba(200,169,110,0.45)"
          strokeWidth="0.75"
        />
      </svg>
      <div
        style={{
          flex: 1,
          height: "1px",
          background:
            "linear-gradient(90deg,rgba(200,169,110,0.25),transparent)",
        }}
      />
    </div>
  );
}
