import D20Icon from "@/components/icons/d20Icon";

// ─── FOOTER ───────────────────────────────────────────────────────────────────
export default function Footer() {
  return (
    <footer
      className="relative py-12 px-6"
      style={{ borderTop: "1px solid rgba(200,169,110,0.12)" }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <D20Icon size={22} />
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              color: "#5a4830",
              fontSize: "14px",
              letterSpacing: "0.15em",
            }}
          >
            TAVERN GATE
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {["Privacy", "Terms", "Contact", "Discord"].map((l) => (
            <a
              key={l}
              href="#"
              className="text-xs hover:opacity-70 transition-opacity"
              style={{
                fontFamily: "serif",
                color: "#4a3820",
                letterSpacing: "0.1em",
              }}
            >
              {l}
            </a>
          ))}
        </div>

        <p
          className="text-xs"
          style={{ fontFamily: "serif", color: "#3a2a14", fontStyle: "italic" }}
        >
          © 2025 Tavern Gate. Guided by Ancient Intelligence.
        </p>
      </div>
    </footer>
  );
}
