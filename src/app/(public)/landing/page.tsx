"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import D20Icon from "@/components/icons/d20Icon";
import CornerRune from "@/components/ornaments/cornerRune";
import Embers from "@/components/ornaments/embers";
import OrnamentalDivider from "@/components/ornaments/ornamentalDivider";
import GoldBar from "@/components/ornaments/goldBar";
import { BookOpen, BrainCircuit, Castle, Swords } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "@/lib/toast";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS — share these across every page
// ─────────────────────────────────────────────────────────────────────────────
// Background base      #0a0806   (near-black parchment)
// Surface card         #1a1208   (dark leather)
// Surface card alt     #120d1a   (dark arcane)
// Border gold          rgba(200,169,110,0.25)
// Border gold hover    rgba(200,169,110,0.50)
// Border purple        rgba(167,139,250,0.20)
// Border purple hover  rgba(167,139,250,0.45)
//
// Text gold primary    #e8d5a3
// Text gold secondary  #c8a96e
// Text gold muted      #8a6f3e
// Text purple          #c4b5fd
// Text body            #9a8878
// Text faint           #5a4830
//
// Accent gold          #c8a96e
// Accent purple        #7c3aed
// Accent crimson       #991b1b
// Accent teal          #0d9488
//
// Gradient atm top     radial-gradient(ellipse 80% 60% at 50% 0%, #3d1f05, transparent)
// Gradient atm left    radial-gradient(ellipse 60% 40% at 20% 100%, #1a0e2e, transparent)
// Gradient atm right   radial-gradient(ellipse 50% 50% at 80% 100%, #0d1f0d, transparent)
// Grid texture         linear-gradient(#c8a96e 1px, transparent 1px) 48px 48px, opacity 0.04
// ─────────────────────────────────────────────────────────────────────────────

// ─── FEATURE CARDS ───────────────────────────────────────────────────────────
const features = [
  {
    icon: <BrainCircuit />,
    title: "AI Dungeon Master",
    desc: "A tireless, infinitely creative intelligence guides your story — reacting to every choice, improvising every moment, never repeating itself.",
    accent: "#c8a96e",
    border: "rgba(200,169,110,0.25)",
    borderHover: "rgba(200,169,110,0.5)",
  },
  {
    icon: <Swords />,
    title: "Multiplayer Realms",
    desc: "Rally up to six adventurers. Coordinate in real-time, split the party (at your peril), and forge legendary bonds — or bitter rivalries.",
    accent: "#e8d5a3",
    border: "rgba(167,139,250,0.2)",
    borderHover: "rgba(167,139,250,0.45)",
  },
  {
    icon: <BookOpen />,
    title: "Community Campaigns",
    desc: "Browse hundreds of player-crafted worlds. Rate them, remix them, or publish your own magnum opus for the world to explore.",
    accent: "#8a6f3e",
    border: "rgba(45,212,191,0.2)",
    borderHover: "rgba(45,212,191,0.4)",
  },
  {
    icon: <Castle />,
    title: "Campaign Forge",
    desc: "Build intricate maps, write lore, design encounters, and set faction politics. Your imagination is the only limit.",
    accent: "#f87171",
    border: "rgba(248,113,113,0.2)",
    borderHover: "rgba(248,113,113,0.4)",
  },
];

// ─── HOW TO PLAY ─────────────────────────────────────────────────────────────
const steps = [
  {
    num: "I",
    title: "Create or Join",
    desc: "Sign in with Google or enter as a guest. Browse open sessions, join a friend's campaign, or forge your own.",
  },
  {
    num: "II",
    title: "Choose Your Path",
    desc: "Pick a community campaign rich with lore, or start a blank slate and describe the world you want to explore.",
  },
  {
    num: "III",
    title: "Build Your Hero",
    desc: "Choose your race, class, and backstory. The AI weaves your history into the living world around you.",
  },
  {
    num: "IV",
    title: "Roll the Dice",
    desc: "Adventure unfolds through conversation and decisions. The AI Dungeon Master narrates, reacts, and challenges you every step.",
  },
];

// ─── CAMPAIGNS SHOWCASE ───────────────────────────────────────────────────────
const campaigns = [
  {
    title: "The Crimson Sanctum",
    genre: "Horror",
    plays: "4.2k",
    rating: "4.9",
    author: "VoidWalker",
    desc: "Ancient vampiric nobility have awakened beneath the city. Only the brave may descend.",
  },
  {
    title: "Shards of the Sunken God",
    genre: "Epic",
    plays: "8.1k",
    rating: "5.0",
    author: "ArcaneForge",
    desc: "A shattered deity's power scatters across the mortal realm. Collect the shards. Become legend.",
  },
  {
    title: "The Merchant's Gambit",
    genre: "Intrigue",
    plays: "2.9k",
    rating: "4.7",
    author: "SilverTongue",
    desc: "Politics, poison, and profit. Navigate the guilds of Varantis or be consumed by them.",
  },
];

// ─── ROOT PAGE ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [isPending, setIsPending] = useState(false);
  const { user, fetchUser } = useAuthStore();
  const router = useRouter();

  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (searchParams.get("reason") == "already-authenticated") {
      toast("You're already signed in. Welcome back!", {
        type: "info",
      });
    }
  }, [mounted, searchParams]);

  const loginHandle = async () => {
    setIsPending(true);
    try {
      console.log("Current user:", user);
      if (user) {
        router.push("/lobby");
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <>
      <main>
        {/* ─── HERO ──────────────────────────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden">
          <Embers />
          <CornerRune className="top-20 left-4" />
          <CornerRune className="top-20 right-4 rotate-90" />

          {/* Radial hero glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(124,58,237,0.07) 0%, transparent 70%)",
            }}
          />

          {/* Badge */}
          <div
            className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
            style={{
              border: "1px solid rgba(200,169,110,0.3)",
              background: "rgba(200,169,110,0.06)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "11px",
                color: "#8a6f3e",
                letterSpacing: "0.2em",
              }}
            >
              AI DUNGEON MASTER AWAITS
            </span>
          </div>
          {/* Headline */}
          <h1
            className="mb-6 leading-tight"
            style={{ fontFamily: "'Cinzel', serif", maxWidth: "820px" }}
          >
            <span
              className="block text-5xl sm:text-6xl md:text-7xl font-bold mb-2"
              style={{
                color: "#e8d5a3",
                textShadow: "0 0 60px rgba(200,169,110,0.3)",
                letterSpacing: "0.04em",
              }}
            >
              Your Legend
            </span>
            <span
              className="block text-5xl sm:text-6xl md:text-7xl font-bold"
              style={{
                background:
                  "linear-gradient(135deg, #c8a96e 0%, #e8d5a3 40%, #a78bfa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "0.04em",
              }}
            >
              Begins Tonight
            </span>
          </h1>

          <p
            className="mb-10 text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
            style={{
              fontFamily: "'Palatino Linotype', Georgia, serif",
              color: "#9a8878",
              fontStyle: "italic",
            }}
          >
            Gather your party. Face dungeons crafted by an ancient intelligence.
            Build worlds others will explore for years to come.
          </p>

          <OrnamentalDivider className="max-w-xs mx-auto mb-10" />

          {/* CTA Buttons */}
          <div className="flex flex-col mb-10 sm:flex-row items-center gap-4">
            {!user && (
              <button
                onClick={loginHandle}
                disabled={isPending}
                className="px-8 py-4 rounded-xl text-base font-bold transition-all duration-200 hover:-translate-y-1"
                style={{
                  fontFamily: "'Cinzel', serif",
                  background: "linear-gradient(135deg, #3d2e10, #2a1f0a)",
                  border: "1px solid rgba(200,169,110,0.5)",
                  color: "#e8d5a3",
                  letterSpacing: "0.08em",
                  boxShadow:
                    "0 0 30px rgba(200,169,110,0.15), inset 0 1px 0 rgba(200,169,110,0.2)",
                }}
              >
                {isPending ? "Loading..." : "⚔ Begin Your Adventure"}
              </button>
            )}
            <a href="#how-to-play">
              <button
                className="px-8 py-4 rounded-xl text-base transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-400/40"
                style={{
                  fontFamily: "'Cinzel', serif",
                  background: "transparent",
                  border: "1px solid rgba(167,139,250,0.25)",
                  color: "#9a85c4",
                  letterSpacing: "0.08em",
                }}
              >
                ✦ See How It Works
              </button>
            </a>
          </div>

          {/* Scroll Hint */}
          <div className="flex flex-col items-center gap-3 opacity-70 select-none">
            {/* Text */}
            <span
              className="tracking-[0.35em] animate-pulse"
              style={{
                fontFamily: "serif",
                fontSize: "10px",
                color: "#c8a96e",
              }}
            >
              SCROLL
            </span>

            {/* Mouse Shape */}
            <div
              className="relative w-4 h-6 rounded-full border flex justify-center overflow-hidden"
              style={{
                borderColor: "rgba(200,169,110,0.5)",
                boxShadow: "0 0 12px rgba(200,169,110,0.15)",
              }}
            >
              {/* Animated Dot */}
              <div
                className="absolute top-2 w-1.5 h-1.5 rounded-full animate-bounce"
                style={{
                  backgroundColor: "#c8a96e",
                }}
              />
            </div>

            {/* Gradient Line */}
            <div
              className="w-px h-10"
              style={{
                background:
                  "linear-gradient(180deg, rgba(200,169,110,0.7), transparent)",
              }}
            />
          </div>
        </section>
        {/* // ─── Features ──────────────────────────────────────────────────────────────────── */}
        <section id="features" className="relative pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p
                className="text-xs tracking-[0.3em] uppercase mb-3"
                style={{ color: "#8a6f3e", fontFamily: "serif" }}
              >
                ✦ The Pillars ✦
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold mb-4"
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: "#e8d5a3",
                  letterSpacing: "0.06em",
                }}
              >
                Why Adventurers Return
              </h2>
              <OrnamentalDivider className="max-w-xs mx-auto" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {features.map((f, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  className="rounded-2xl py-6 px-3 transition-all duration-300 cursor-default"
                  style={{
                    background:
                      hovered === i
                        ? "linear-gradient(160deg, #1e1810, #140f1c)"
                        : "linear-gradient(160deg, #1a1208, #120d1a)",
                    border: `1px solid ${hovered === i ? f.borderHover : f.border}`,
                    boxShadow:
                      hovered === i ? `0 0 30px ${f.accent}18` : "none",
                    transform: hovered === i ? "translateY(-4px)" : "none",
                  }}
                >
                  <div className="flex items-center space-x-2">
                    {f.icon && (
                      <div className={`text-xl mb-4 text-[${f.accent}]`}>
                        {f.icon}
                      </div>
                    )}
                    <h3
                      className="text-base text-justify font-bold mb-3"
                      style={{
                        fontFamily: "'Cinzel', serif",
                        color: "#e8d5a3",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {f.title}
                    </h3>
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      fontFamily: "Georgia, serif",
                      color: "#7a6548",
                      fontStyle: "italic",
                    }}
                  >
                    {f.desc}
                  </p>
                  <div
                    className="mt-5 h-px"
                    style={{
                      background: `linear-gradient(90deg, ${f.accent}40, transparent)`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* // ─── Stats ──────────────────────────────────────────────────────────────────── */}
        <section className="relative py-20 px-6 overflow-hidden">
          <GoldBar />
          <div
            className="absolute inset-0"
            style={{ background: "rgba(200,169,110,0.03)" }}
          />
          <div className="max-w-4xl mx-auto relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { val: "50K+", label: "Adventurers" },
                { val: "12K+", label: "Campaigns" },
                { val: "2M+", label: "Sessions Played" },
                { val: "∞", label: "Stories Untold" },
              ].map((s) => (
                <div key={s.label}>
                  <div
                    className="text-3xl sm:text-4xl font-bold mb-1"
                    style={{
                      fontFamily: "'Cinzel', serif",
                      color: "#e8d5a3",
                      textShadow: "0 0 20px rgba(200,169,110,0.3)",
                    }}
                  >
                    {s.val}
                  </div>
                  <div
                    className="text-xs tracking-[0.2em] uppercase"
                    style={{ color: "#8a6f3e", fontFamily: "serif" }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <GoldBar />
        </section>
        {/* // ─── How to Play ──────────────────────────────────────────────────────────────────── */}
        <section id="how-to-play" className="relative py-20 px-6">
          {/* Section glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 40% at 50% 50%, rgba(124,58,237,0.05) 0%, transparent 70%)",
            }}
          />

          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p
                className="text-xs tracking-[0.3em] uppercase mb-3"
                style={{ color: "#8a6f3e", fontFamily: "serif" }}
              >
                ✦ The Path ✦
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold mb-4"
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: "#e8d5a3",
                  letterSpacing: "0.06em",
                }}
              >
                How to Play
              </h2>
              <OrnamentalDivider className="max-w-xs mx-auto" />
            </div>
            <div className="space-y-8">
              {steps.map((s, i) => (
                <div
                  key={i}
                  className={`flex flex-col lg:flex-row items-center gap-6 lg:gap-12 ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
                >
                  {/* Number orb */}
                  <div className="flex-shrink-0 relative">
                    <div
                      className="absolute inset-0 rounded-full blur-xl opacity-30"
                      style={{
                        background: "radial-gradient(#c8a96e, #7c3aed)",
                      }}
                    />
                    <div
                      className="relative w-20 h-20 rounded-full flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, #1e1508, #2d1f0a)",
                        border: "1px solid rgba(200,169,110,0.4)",
                        boxShadow: "0 0 20px rgba(200,169,110,0.15)",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Cinzel', serif",
                          fontSize: "22px",
                          color: "#e8d5a3",
                          fontWeight: 700,
                        }}
                      >
                        {s.num}
                      </span>
                    </div>
                  </div>

                  {/* Content card */}
                  <div
                    className="flex-1 rounded-2xl p-6 lg:p-8"
                    style={{
                      background: "linear-gradient(160deg, #1a1208, #120d1a)",
                      border: "1px solid rgba(200,169,110,0.15)",
                    }}
                  >
                    <h3
                      className="text-xl font-bold mb-3"
                      style={{
                        fontFamily: "'Cinzel', serif",
                        color: "#e8d5a3",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {s.title}
                    </h3>
                    <p
                      className="leading-relaxed"
                      style={{
                        fontFamily: "Georgia, serif",
                        color: "#7a6548",
                        fontStyle: "italic",
                      }}
                    >
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* // ─── Campaigns ──────────────────────────────────────────────────────────────────── */}
        <section id="campaigns" className="relative pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p
                className="text-xs tracking-[0.3em] uppercase mb-3"
                style={{ color: "#8a6f3e", fontFamily: "serif" }}
              >
                ✦ The Codex ✦
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold mb-4"
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: "#e8d5a3",
                  letterSpacing: "0.06em",
                }}
              >
                Featured Campaigns
              </h2>
              <p
                className="text-sm max-w-md mx-auto mb-6"
                style={{
                  fontFamily: "Georgia, serif",
                  color: "#7a6548",
                  fontStyle: "italic",
                }}
              >
                Forged by the community. Approved by legend.
              </p>
              <OrnamentalDivider className="max-w-xs mx-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {campaigns.map((c, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  className="rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer"
                  style={{
                    background: "linear-gradient(160deg, #1a1208, #120d1a)",
                    border: `1px solid ${hovered === i ? "rgba(200,169,110,0.45)" : "rgba(200,169,110,0.15)"}`,
                    transform: hovered === i ? "translateY(-6px)" : "none",
                    boxShadow:
                      hovered === i
                        ? "0 16px 40px rgba(0,0,0,0.4), 0 0 30px rgba(200,169,110,0.08)"
                        : "none",
                  }}
                >
                  {/* Card header band */}
                  <div
                    className="h-1.5"
                    style={{
                      background: `linear-gradient(90deg, rgba(200,169,110,0.6), rgba(124,58,237,0.4))`,
                    }}
                  />

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="text-xs px-2.5 py-1 rounded-full"
                        style={{
                          fontFamily: "'Cinzel', serif",
                          background: "rgba(200,169,110,0.1)",
                          border: "1px solid rgba(200,169,110,0.2)",
                          color: "#8a6f3e",
                          letterSpacing: "0.1em",
                        }}
                      >
                        {c.genre}
                      </span>
                      <span
                        style={{
                          fontFamily: "serif",
                          color: "#c8a96e",
                          fontSize: "13px",
                        }}
                      >
                        ★ {c.rating}
                      </span>
                    </div>

                    <h3
                      className="text-lg font-bold mb-2"
                      style={{
                        fontFamily: "'Cinzel', serif",
                        color: "#e8d5a3",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {c.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed mb-4"
                      style={{
                        fontFamily: "Georgia, serif",
                        color: "#7a6548",
                        fontStyle: "italic",
                      }}
                    >
                      {c.desc}
                    </p>

                    <div
                      className="flex items-center justify-between pt-4"
                      style={{ borderTop: "1px solid rgba(200,169,110,0.1)" }}
                    >
                      <span
                        className="text-xs"
                        style={{ color: "#5a4830", fontFamily: "serif" }}
                      >
                        by {c.author}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "#5a4830", fontFamily: "serif" }}
                      >
                        {c.plays} plays
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link href="/campaigns">
                <button
                  className="px-6 py-3 rounded-xl text-sm transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    background: "transparent",
                    border: "1px solid rgba(200,169,110,0.3)",
                    color: "#8a6f3e",
                    letterSpacing: "0.08em",
                  }}
                >
                  Browse All Campaigns →
                </button>
              </Link>
            </div>
          </div>
        </section>
        {/* // ─── FINAL CTA ──────────────────────────────────────────────────────────────── */}
        <section className="relative pb-20 px-6 text-center overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(124,58,237,0.08) 0%, transparent 70%)",
            }}
          />

          <CornerRune className="top-8 left-8" />
          <CornerRune className="top-8 right-8 rotate-90" />
          <CornerRune className="bottom-8 left-8 -rotate-90" />
          <CornerRune className="bottom-8 right-8 rotate-180" />

          <div className="max-w-2xl mx-auto">
            <D20Icon size={56} />
            <h2
              className="mt-6 mb-4 text-3xl sm:text-5xl font-bold"
              style={{
                fontFamily: "'Cinzel', serif",
                color: "#e8d5a3",
                letterSpacing: "0.06em",
                textShadow: "0 0 40px rgba(200,169,110,0.3)",
              }}
            >
              Your Tale Awaits
            </h2>
            <p
              className="mb-10 text-base leading-relaxed"
              style={{
                fontFamily: "Georgia, serif",
                color: "#7a6548",
                fontStyle: "italic",
              }}
            >
              "Not all who wander are lost — but all who enter Tavern Gate find
              what they seek."
            </p>
            <OrnamentalDivider className="max-w-xs mx-auto mb-10" />

            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={loginHandle}
                  disabled={isPending}
                  className="px-10 py-4 rounded-xl text-base font-bold transition-all duration-200 hover:-translate-y-1"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    background: "linear-gradient(135deg, #3d2e10, #2a1f0a)",
                    border: "1px solid rgba(200,169,110,0.5)",
                    color: "#e8d5a3",
                    letterSpacing: "0.1em",
                    boxShadow:
                      "0 0 40px rgba(200,169,110,0.15), inset 0 1px 0 rgba(200,169,110,0.2)",
                  }}
                >
                  {isPending ? "Loading..." : "⚔ Enter the Realm"}
                </button>
                <button
                  onClick={loginHandle}
                  disabled={isPending}
                  className="px-10 py-4 rounded-xl text-base transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    background: "transparent",
                    border: "1px solid rgba(167,139,250,0.3)",
                    color: "#9a85c4",
                    letterSpacing: "0.1em",
                  }}
                >
                  {isPending ? "Loading..." : "✦ Wander as a Stranger"}
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
