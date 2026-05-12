// ── Floating embers ──────────────────────────────────────────────────────────
export default function Embers() {
  return (
    <>
      {[
        { top: "12%", left: "7%", d: "3.2s", dd: "0s" },
        { top: "55%", left: "4%", d: "4.1s", dd: "1.4s" },
        { top: "80%", left: "12%", d: "3.6s", dd: "0.8s" },
        { top: "22%", right: "5%", d: "3.8s", dd: "0.4s" },
        { top: "65%", right: "8%", d: "4.4s", dd: "2.1s" },
        { top: "90%", right: "15%", d: "3s", dd: "1.7s" },
        { top: "38%", left: "20%", d: "4.8s", dd: "0.2s" },
        { top: "47%", right: "22%", d: "3.3s", dd: "3s" },
      ].map((e, i) => (
        <span
          key={i}
          className="absolute w-1 h-1 rounded-full pointer-events-none"
          style={{
            ...e,
            background:
              i % 3 === 0 ? "#f59e0b" : i % 3 === 1 ? "#c8a96e" : "#a78bfa",
            animation: `ember ${e.d} ease-in-out ${e.dd} infinite`,
            opacity: 0.5,
          }}
        />
      ))}
    </>
  );
}
