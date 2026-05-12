export default function D20Icon({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} aria-hidden="true">
      <polygon
        points="30,4 55,18 55,42 30,56 5,42 5,18"
        fill="none"
        stroke="#c8a96e"
        strokeWidth="1.5"
      />
      <polygon
        points="30,4 55,18 30,28"
        fill="rgba(200,169,110,0.06)"
        stroke="#c8a96e"
        strokeWidth="0.75"
      />
      <polygon
        points="30,4 5,18 30,28"
        fill="rgba(200,169,110,0.04)"
        stroke="#c8a96e"
        strokeWidth="0.75"
      />
      <polygon
        points="30,28 55,18 55,42"
        fill="rgba(200,169,110,0.08)"
        stroke="#c8a96e"
        strokeWidth="0.75"
      />
      <polygon
        points="30,28 5,18 5,42"
        fill="rgba(200,169,110,0.05)"
        stroke="#c8a96e"
        strokeWidth="0.75"
      />
      <polygon
        points="30,28 55,42 30,56"
        fill="rgba(200,169,110,0.07)"
        stroke="#c8a96e"
        strokeWidth="0.75"
      />
      <polygon
        points="30,28 5,42 30,56"
        fill="rgba(200,169,110,0.04)"
        stroke="#c8a96e"
        strokeWidth="0.75"
      />
    </svg>
  );
}
