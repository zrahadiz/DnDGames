"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { createAuthClient } from "better-auth/client";
import { ShieldAlert, Pickaxe } from "lucide-react";
import { useRouter } from "next/navigation";
import Loading from "@/components/feedback/loading";
import CornerRune from "@/components/ornaments/cornerRune";
import OrnamentalDivider from "@/components/ornaments/ornamentalDivider";
import Embers from "@/components/ornaments/embers";
import GoogleIcon from "@/components/icons/googleIcon";
import PageBackground from "@/components/layout/pageBackground";
import D20Icon from "@/components/icons/d20Icon";

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

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0806]">
      <Loading status={loadingState} fullscreen text={loadingText} />

      {/* ── Parchment / atmospheric background ── */}
      <PageBackground />

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
      <Embers />

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
                  <D20Icon size={32} />
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
