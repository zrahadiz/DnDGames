"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { createAuthClient } from "better-auth/client";
import { ShieldAlert, Pickaxe } from "lucide-react";
import { useRouter } from "next/navigation";
import Loading from "@/components/ui/loading";
import CornerRune from "@/components/ornaments/cornerRune";
import OrnamentalDivider from "@/components/ornaments/ornamentalDivider";

// ─── Inline SVG Icons ──────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

// ─── Floating Particle ─────────────────────────────────────────────────────
const Particle = ({ style }: { style: React.CSSProperties }) => (
  <span
    className="absolute w-1 h-1 rounded-full bg-amber-400/40 animate-pulse pointer-events-none"
    style={style}
  />
);

// ─── Main Component ────────────────────────────────────────────────────────
export default function LoginPage() {
  const authClient = createAuthClient();
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);
  const router = useRouter();

  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const handleGoogle = async () => {
    setLoadingState(true);
    setLoadingText("Signing in...");
    try {
      const data = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/lobby",
      });
      console.log("Google login response:", data);
    } catch (error) {
      console.error("Google login error:", error);
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const handleGuest = async () => {
    setLoadingState(true);
    setLoadingText("Summoning a Stranger...");
    try {
      const { data } = await api.post("/auth/guest");
      if (data.success) {
        router.replace("/lobby");
      }
      console.log("Guest login response:", data);
    } catch (error) {
      console.error("Guest login error:", error);
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const particles = [
    { top: "15%", left: "8%", animationDelay: "0s", animationDuration: "3s" },
    { top: "72%", left: "5%", animationDelay: "1.2s", animationDuration: "4s" },
    {
      top: "40%",
      right: "6%",
      animationDelay: "0.6s",
      animationDuration: "3.5s",
    },
    {
      top: "88%",
      right: "10%",
      animationDelay: "2s",
      animationDuration: "2.8s",
    },
    {
      top: "25%",
      right: "20%",
      animationDelay: "1.8s",
      animationDuration: "4.2s",
    },
    {
      top: "60%",
      left: "18%",
      animationDelay: "0.3s",
      animationDuration: "3.8s",
    },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0806]">
      <Loading status={loadingState} fullscreen text={loadingText} />

      {/* ── Parchment / atmospheric background ── */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 50% 0%, #3d1f05 0%, transparent 70%),
            radial-gradient(ellipse 60% 40% at 20% 100%, #1a0e2e 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 80% 100%, #0d1f0d 0%, transparent 60%)
          `,
        }}
      />

      {/* ── Grid / map texture ── */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(#c8a96e 1px, transparent 1px),
            linear-gradient(90deg, #c8a96e 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Vignette ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 40%, rgba(0,0,0,0.75) 100%)",
        }}
      />

      {/* ── Floating embers ── */}
      {particles.map((p, i) => (
        <Particle key={i} style={p} />
      ))}

      {/* ── Corner rune decorations ── */}
      <CornerRune className="top-4 left-4 rotate-0" />
      <CornerRune className="top-4 right-4 rotate-90" />
      <CornerRune className="bottom-4 left-4 -rotate-90" />
      <CornerRune className="bottom-4 right-4 rotate-180" />

      {/* ── Main Card ── */}
      <main className="relative z-10 w-full max-w-md mx-4">
        {/* Card border glow */}
        <div
          className="absolute rounded-2xl opacity-60"
          style={{
            background:
              "linear-gradient(135deg, #c8a96e33, #7c3aed22, #c8a96e33)",
          }}
        />

        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background:
              "linear-gradient(160deg, #1a1208 0%, #0f0c06 50%, #120d1a 100%)",
            border: "1px solid rgba(200, 169, 110, 0.25)",
            boxShadow:
              "0 0 60px rgba(200, 169, 110, 0.08), 0 0 120px rgba(124, 58, 237, 0.06), inset 0 1px 0 rgba(200, 169, 110, 0.12)",
          }}
        >
          {/* Top ornamental bar */}
          <div
            className="h-px w-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, #c8a96e80, #c8a96e, #c8a96e80, transparent)",
            }}
          />

          <div className="px-8 pt-10 pb-10">
            {/* ── Logo / Crest ── */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4">
                {/* Glow ring */}
                <div
                  className="absolute inset-0 rounded-full blur-xl opacity-40"
                  style={{ background: "radial-gradient(#c8a96e, #7c3aed)" }}
                />
                <div
                  className="relative flex items-center justify-center w-20 h-20 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #1e1508, #2d1f0a)",
                    border: "1px solid rgba(200, 169, 110, 0.4)",
                    boxShadow:
                      "0 0 24px rgba(200, 169, 110, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}
                >
                  {/* D20 SVG */}
                  <svg
                    viewBox="0 0 60 60"
                    className="w-10 h-10"
                    aria-hidden="true"
                  >
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
                    <text
                      x="30"
                      y="35"
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="bold"
                      fill="#c8a96e"
                      fontFamily="serif"
                    >
                      20
                    </text>
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h1
                className="text-3xl font-bold tracking-widest uppercase text-center mb-1"
                style={{
                  fontFamily: "'Cinzel', 'Palatino Linotype', serif",
                  color: "#e8d5a3",
                  textShadow: "0 0 30px rgba(200, 169, 110, 0.4)",
                  letterSpacing: "0.2em",
                }}
              >
                Tavern Gate
              </h1>
              <p
                className="text-xs tracking-[0.3em] uppercase"
                style={{ color: "#8a6f3e", fontFamily: "serif" }}
              >
                ✦ Multiplayer Realm ✦
              </p>
            </div>

            {/* ── Flavor text ── */}
            <p
              className="text-center text-sm mb-8 leading-relaxed px-2"
              style={{
                color: "#7a6548",
                fontFamily: "'Palatino Linotype', Georgia, serif",
                fontStyle: "italic",
              }}
            >
              "The ancient doors creak open. Your legend begins with a single
              step across the threshold…"
            </p>

            {/* ── Divider ── */}
            <OrnamentalDivider />

            {/* ── Buttons ── */}
            <div className="mt-8 space-y-3">
              {/* Google */}
              <button
                onClick={handleGoogle}
                onMouseEnter={() => setHoveredBtn("google")}
                onMouseLeave={() => setHoveredBtn(null)}
                className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer select-none"
                style={{
                  background:
                    hoveredBtn === "google"
                      ? "linear-gradient(135deg, #2a1f0a, #1e1808)"
                      : "linear-gradient(135deg, #1e1808, #160f04)",
                  border: `1px solid ${hoveredBtn === "google" ? "rgba(200,169,110,0.5)" : "rgba(200,169,110,0.25)"}`,
                  color: "#d4b87a",
                  boxShadow:
                    hoveredBtn === "google"
                      ? "0 0 20px rgba(200, 169, 110, 0.12), inset 0 1px 0 rgba(200,169,110,0.1)"
                      : "none",
                  transform:
                    hoveredBtn === "google" ? "translateY(-1px)" : "none",
                }}
              >
                <GoogleIcon />
                <span
                  style={{
                    fontFamily: "'Cinzel', serif",
                    letterSpacing: "0.05em",
                  }}
                >
                  Enter with Google
                </span>
              </button>

              {/* Separator */}
              <div className="flex items-center gap-3 py-1">
                <div
                  className="flex-1 h-px"
                  style={{ background: "rgba(200,169,110,0.15)" }}
                />
                <span
                  className="text-xs"
                  style={{
                    color: "#5a4830",
                    fontFamily: "serif",
                    fontStyle: "italic",
                  }}
                >
                  or
                </span>
                <div
                  className="flex-1 h-px"
                  style={{ background: "rgba(200,169,110,0.15)" }}
                />
              </div>

              {/* Guest */}
              <button
                onClick={handleGuest}
                onMouseEnter={() => setHoveredBtn("guest")}
                onMouseLeave={() => setHoveredBtn(null)}
                className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer select-none"
                style={{
                  background:
                    hoveredBtn === "guest"
                      ? "linear-gradient(135deg, #1a0d2a, #120820)"
                      : "transparent",
                  border: `1px solid ${hoveredBtn === "guest" ? "rgba(167,139,250,0.4)" : "rgba(167,139,250,0.2)"}`,
                  color: hoveredBtn === "guest" ? "#c4b5fd" : "#9a85c4",
                  boxShadow:
                    hoveredBtn === "guest"
                      ? "0 0 20px rgba(124, 58, 237, 0.1), inset 0 1px 0 rgba(167,139,250,0.1)"
                      : "none",
                  transform:
                    hoveredBtn === "guest" ? "translateY(-1px)" : "none",
                }}
              >
                <Pickaxe />
                <span
                  style={{
                    fontFamily: "'Cinzel', serif",
                    letterSpacing: "0.05em",
                  }}
                >
                  Venture as a Stranger
                </span>
              </button>
            </div>

            {/* ── Footer note ── */}
            <p
              className="text-center text-xs mt-8"
              style={{
                color: "#4a3820",
                fontFamily: "serif",
                fontStyle: "italic",
              }}
            >
              By entering, you accept the{" "}
              <a
                href="#"
                className="underline underline-offset-2 hover:opacity-80 transition-opacity"
                style={{ color: "#6a5030" }}
              >
                Realm's Laws
              </a>{" "}
              &{" "}
              <a
                href="#"
                className="underline underline-offset-2 hover:opacity-80 transition-opacity"
                style={{ color: "#6a5030" }}
              >
                Scrolls of Privacy
              </a>
            </p>
          </div>

          {/* Bottom ornamental bar */}
          <div
            className="h-px w-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, #c8a96e40, #c8a96e60, #c8a96e40, transparent)",
            }}
          />
        </div>

        {/* ── "Powered by AI Dungeon Master" badge ── */}
        <p
          className="text-center mt-5 text-xs flex items-center justify-center gap-2"
          style={{ color: "#3a2e1a" }}
        >
          <ShieldAlert className="w-6 h-6" />
          <span style={{ fontFamily: "serif", fontStyle: "italic" }}>
            Guided by an Ancient Intelligence
          </span>
        </p>
      </main>
    </div>
  );
}
