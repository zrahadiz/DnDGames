"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface HistoryEntry {
  result: number;
  sides: Number;
  isCrit: boolean;
  isFail: boolean;
}

// Simplified props — remove onResult sides param since it's always 100
interface DiceRollOverlayProps {
  open: boolean;
  onClose: () => void;
  onResult?: (result: number, isCrit: boolean, isFail: boolean) => void;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DiceRollOverlay({
  open,
  onClose,
  onResult,
}: DiceRollOverlayProps) {
  const [rolling, setRolling] = useState(false);
  const [phase, setPhase] = useState<"idle" | "rolling" | "reveal">("idle");
  const [displayNumber, setDisplayNumber] = useState<number | string>("?");
  const [result, setResult] = useState<number | null>(null);
  const [isCrit, setIsCrit] = useState(false);
  const [isFail, setIsFail] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const scrambleRef = useRef<NodeJS.Timeout | null>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !rolling) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [rolling, onClose]);

  const startRollRef = useRef<() => void>(() => {});
  const startRoll = useCallback(() => {
    if (rolling) return;
    setRolling(true);
    setPhase("rolling");
    setDisplayNumber("?");
    setResult(null);
    setIsCrit(false);
    setIsFail(false);

    const finalResult = Math.floor(Math.random() * 100) + 1; // max 100
    const crit = finalResult === 100;
    const fail = finalResult === 1;

    let count = 0;
    scrambleRef.current = setInterval(() => {
      setDisplayNumber(Math.floor(Math.random() * 100) + 1);
      count++;
      if (count >= 14) clearInterval(scrambleRef.current!);
    }, 70);

    setTimeout(() => {
      clearInterval(scrambleRef.current!);
      setPhase("reveal");
      setResult(finalResult);
      setDisplayNumber(finalResult);
      setIsCrit(crit);
      setIsFail(fail);
      setHistory((prev) =>
        [
          { result: finalResult, sides: 100, isCrit: crit, isFail: fail },
          ...prev,
        ].slice(0, 7),
      );
      onResult?.(finalResult, crit, fail);
      setTimeout(() => setRolling(false), 600);
    }, 950);
  }, [rolling, onResult]);

  // Keep ref in sync
  useEffect(() => {
    startRollRef.current = startRoll;
  }, [startRoll]);

  // Auto-roll on open
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => startRollRef.current(), 80); // tiny delay so mount completes
      return () => clearTimeout(t);
    } else {
      setPhase("idle");
      setDisplayNumber("?");
      setResult(null);
      setIsCrit(false);
      setIsFail(false);
      if (scrambleRef.current) clearInterval(scrambleRef.current);
    }
  }, [open]);

  if (!open) return null;

  const resultLabel = isCrit
    ? "✦ Critical Hit!"
    : isFail
      ? "✗ Critical Fail"
      : result !== null
        ? `You rolled ${result}`
        : "Roll the dice";

  const labelColor = isCrit
    ? "text-amber-400"
    : isFail
      ? "text-[#f87171]"
      : "text-[#c8a96e]";

  const glowColor = isCrit
    ? "rgba(251,191,36,0.15)"
    : isFail
      ? "rgba(248,113,113,0.1)"
      : rolling
        ? "rgba(200,169,110,0.08)"
        : "transparent";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(8px)" }}
        onClick={() => {
          if (!rolling) onClose();
        }}
      >
        <div
          className="relative flex flex-col items-center gap-6 p-8 rounded-2xl border border-[rgba(200,169,110,0.2)] transition-all duration-500"
          style={{
            background: "linear-gradient(160deg,#1a1208,#0f0c06,#120d1a)",
            boxShadow: `0 0 80px ${glowColor}, 0 0 40px rgba(0,0,0,0.6)`,
            minWidth: "280px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
            style={{
              background:
                "linear-gradient(90deg,transparent,rgba(200,169,110,0.8),transparent)",
            }}
          />

          {/* Header */}
          <p className="text-[10px] tracking-[0.3em] uppercase font-serif text-[#5a4830]">
            ✦ The Dice Oracle ✦
          </p>

          {/* Dice SVG — fixed d100 shape */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full transition-all duration-500"
              style={{
                background: isCrit
                  ? "radial-gradient(circle,rgba(251,191,36,0.15) 40%,transparent 70%)"
                  : isFail
                    ? "radial-gradient(circle,rgba(248,113,113,0.1) 40%,transparent 70%)"
                    : rolling
                      ? "radial-gradient(circle,rgba(200,169,110,0.08) 40%,transparent 70%)"
                      : "none",
              }}
            />

            <svg
              viewBox="0 0 140 140"
              width="130"
              height="130"
              className={
                phase === "rolling"
                  ? "dice-rolling"
                  : phase === "reveal"
                    ? "dice-reveal"
                    : ""
              }
              style={{
                filter: `drop-shadow(0 0 ${isCrit ? "28px rgba(251,191,36,0.5)" : isFail ? "28px rgba(248,113,113,0.4)" : "16px rgba(200,169,110,0.3)"})`,
              }}
            >
              {/* d100 circle shape */}
              <circle
                fill="rgba(200,169,110,0.07)"
                stroke="#c8a96e"
                strokeWidth="1.2"
                cx="70"
                cy="70"
                r="56"
              />
              <circle
                fill="none"
                stroke="rgba(200,169,110,0.2)"
                strokeWidth="0.6"
                cx="70"
                cy="70"
                r="38"
              />
              <line
                fill="none"
                stroke="rgba(200,169,110,0.25)"
                strokeWidth="0.7"
                x1="70"
                y1="14"
                x2="70"
                y2="126"
              />
              <line
                fill="none"
                stroke="rgba(200,169,110,0.25)"
                strokeWidth="0.7"
                x1="14"
                y1="70"
                x2="126"
                y2="70"
              />
              <line
                fill="none"
                stroke="rgba(200,169,110,0.25)"
                strokeWidth="0.7"
                x1="30"
                y1="30"
                x2="110"
                y2="110"
              />
              <line
                fill="none"
                stroke="rgba(200,169,110,0.25)"
                strokeWidth="0.7"
                x1="110"
                y1="30"
                x2="30"
                y2="110"
              />
              <text
                x="70"
                y="74"
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="'Cinzel',serif"
                fontWeight="700"
                fontSize="22"
                fill={isCrit ? "#fbbf24" : isFail ? "#f87171" : "#e8d5a3"}
                className={phase === "reveal" ? "num-pop" : ""}
                style={{ opacity: phase === "rolling" ? 0.3 : 1 }}
              >
                {displayNumber}
              </text>
            </svg>
          </div>

          {/* Result label */}
          <p
            key={result ?? "idle"}
            className={`text-sm font-cinzel tracking-wider text-center fade-up ${labelColor}`}
          >
            {resultLabel}
          </p>

          {/* Close — only shown after reveal */}
          {phase === "reveal" && (
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-[rgba(200,169,110,0.25)] bg-transparent font-cinzel text-xs tracking-wider text-[#8a6f3e] hover:border-[rgba(200,169,110,0.45)] hover:text-[#c8a96e] transition-all cursor-pointer fade-up"
            >
              Close
            </button>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="flex gap-1.5 flex-wrap justify-center max-w-[240px]">
              {history.map((h, i) => (
                <span
                  key={i}
                  className={`chip-in rounded-full border px-2.5 py-0.5 text-[11px] font-cinzel ${h.isCrit ? "border-amber-400/40 text-amber-400" : h.isFail ? "border-[rgba(248,113,113,0.3)] text-[#f87171]" : "border-[rgba(200,169,110,0.2)] text-[#5a4830]"}`}
                >
                  {h.result}
                </span>
              ))}
            </div>
          )}

          <div
            className="absolute bottom-0 left-0 right-0 h-px rounded-b-2xl"
            style={{
              background:
                "linear-gradient(90deg,transparent,rgba(200,169,110,0.8),transparent)",
            }}
          />
        </div>
      </div>
    </>
  );
}
