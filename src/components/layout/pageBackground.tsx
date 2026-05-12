// ── Shared page background ───────────────────────────────────────────────────
export default function PageBg() {
  return (
    <>
      <div className="fixed inset-0 bg-[#0a0806] -z-10" />
      <div
        className="fixed inset-0 opacity-30 -z-10"
        style={{
          backgroundImage: `
        radial-gradient(ellipse 80% 60% at 50% 0%, #3d1f05 0%, transparent 70%),
        radial-gradient(ellipse 60% 40% at 20% 100%, #1a0e2e 0%, transparent 60%),
        radial-gradient(ellipse 50% 50% at 80% 100%, #0d1f0d 0%, transparent 60%)
      `,
        }}
      />
      <div
        className="fixed inset-0 opacity-[0.035] -z-10"
        style={{
          backgroundImage: `linear-gradient(#c8a96e 1px, transparent 1px), linear-gradient(90deg, #c8a96e 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background:
            "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </>
  );
}
