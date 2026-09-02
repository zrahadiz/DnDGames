// ─── Corner Rune Decoration ────────────────────────────────────────────────
export default function CornerRune({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={`absolute w-10 h-10 opacity-20 pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <path
        d="M2 2 L2 20 M2 2 L20 2"
        stroke="#c8a96e"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6 6 L6 16 M6 6 L16 6"
        stroke="#c8a96e"
        strokeWidth="0.75"
        strokeLinecap="round"
      />
      <circle cx="6" cy="6" r="1.5" fill="#c8a96e" />
    </svg>
  );
}
