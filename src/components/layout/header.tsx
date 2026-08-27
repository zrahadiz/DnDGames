// ─── NAVIGATION ─────────────────────────────────────────────────────────────
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import D20Icon from "@/components/icons/d20Icon";
import { useAuthStore } from "@/stores/auth-store";
import { usePathname } from "next/navigation";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, fetchUser } = useAuthStore();
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/landing" },
    { label: "Lobby", href: "/lobby" },
    { label: "Campaigns", href: "/campaigns" },
  ];

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(10,8,6,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(200,169,110,0.15)"
          : "1px solid transparent",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between md:grid md:grid-cols-3">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <D20Icon size={28} />
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              color: "#e8d5a3",
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "0.15em",
            }}
          >
            TAVERN GATE
          </span>
        </div>

        {/* Center */}
        <div className="hidden md:flex justify-center items-center gap-8">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative text-sm transition-all duration-300 ${
                  active
                    ? "text-[#e8d5a3]"
                    : "text-[#8a6f3e] hover:text-[#d4b87a]"
                }`}
                style={{
                  fontFamily: "'Cinzel', serif",
                  letterSpacing: "0.08em",
                }}
              >
                {item.label}

                <span
                  className={`absolute left-0 -bottom-1 h-[2px] rounded-full bg-[#d4b87a] transition-all duration-300 ${
                    active ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        {/* CTA */}

        <div className="flex justify-end items-center">
          {!user && (
            <Link href="/login">
              <button
                className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  fontFamily: "'Cinzel', serif",
                  background: "linear-gradient(135deg, #2a1f0a, #1e1808)",
                  border: "1px solid rgba(200,169,110,0.4)",
                  color: "#d4b87a",
                  letterSpacing: "0.06em",
                  boxShadow: "0 0 16px rgba(200,169,110,0.1)",
                }}
              >
                Enter the Realm
              </button>
            </Link>
          )}
          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col  gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block w-6 h-px transition-all duration-200"
                style={{ background: "#c8a96e" }}
              />
            ))}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            background: "rgba(10,8,6,0.97)",
            borderBottom: "1px solid rgba(200,169,110,0.2)",
          }}
          className="md:hidden px-6 pb-6"
        >
          {["Landing", "Lobby", "Campaigns"].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase().replace(/ /g, "-")}`}
              className="block py-3 text-sm border-b"
              style={{
                fontFamily: "'Cinzel', serif",
                color: "#8a6f3e",
                borderColor: "rgba(200,169,110,0.1)",
              }}
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
          {!user && (
            <Link href="/login">
              <button
                className="mt-4 w-full py-2.5 rounded-lg text-sm"
                style={{
                  fontFamily: "'Cinzel', serif",
                  background: "linear-gradient(135deg, #2a1f0a, #1e1808)",
                  border: "1px solid rgba(200,169,110,0.4)",
                  color: "#d4b87a",
                }}
              >
                Enter the Realm
              </button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
