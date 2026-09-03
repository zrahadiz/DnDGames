import { CreateCombatInput, GameEventWithRelations } from "@/types/gameEvents";
import { RoomDetail } from "@/types/rooms";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import GoldBar from "@/components/ornaments/goldBar";
import CustomFieldLabel from "@/components/forms/customFieldLabel";
import OrnamentalDivider from "@/components/ornaments/ornamentalDivider";
import { X } from "lucide-react";
import { Badge } from "../ui/badge";

interface CombatFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  combatInput: CreateCombatInput;
  handleCombatInput: (key: keyof CreateCombatInput, value: string) => void;
  onCombat: () => void;
}

export function PlayerSideCard({
  player,
  onKick,
}: {
  player: RoomDetail["players"][number];
  onKick?: () => void;
}) {
  const role = player.role ?? "player";
  const hp = player.character?.hp ?? 0;
  const mana = player.character?.mana ?? 0;
  const maxHp = player.character?.hp ?? hp;
  const maxMana = player.character?.mana ?? mana;
  const hpPct = maxHp > 0 ? Math.round((hp / maxHp) * 100) : 100;
  const manaPct = maxMana > 0 ? Math.round((mana / maxMana) * 100) : 100;

  return (
    <div
      className={`rounded-xl border p-3 space-y-2.5 transition-all ${
        player.isConnected
          ? "border-[rgba(200,169,110,0.15)] bg-[rgba(26,18,8,0.7)]"
          : "border-[rgba(90,72,48,0.2)] bg-black/30 opacity-60"
      }`}
    >
      {/* Name row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="p-0 h-6 w-6 rounded-lg border border-[rgba(90,72,48,0.2)] bg-black/30 text-[#5a4830] hover:bg-[rgba(90,72,48,0.1)] hover:text-[#8a6f3e] transition-all duration-150 cursor-pointer"
            onClick={onKick}
          >
            <X className="text-[#5a4830]" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[13px] font-cinzel tracking-wide text-[#e8d5a3] truncate">
                {player.character?.name ?? "Unknown"}
              </p>
              <Badge className="border-[rgba(200,169,110,0.3)] bg-[rgba(200,169,110,0.1)] text-[#c8a96e] text-[10px] font-serif italic px-1.5 py-0">
                {role}
              </Badge>
            </div>
            <p className="text-[11px] font-serif italic text-[#5a4830] truncate">
              {player.character?.race} · {player.character?.characterClass}
            </p>
          </div>
        </div>
        {/* Online dot */}
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            player.isConnected ? "bg-emerald-400" : "bg-[#5a4830]"
          }`}
          title={player.isConnected ? "Online" : "Offline"}
        />
      </div>

      {/* Level */}
      <div className="flex items-center justify-between text-[10px] font-cinzel tracking-wide">
        <span className="text-[#8a6f3e]">
          Level {player.character?.level ?? 1}
        </span>
      </div>

      {/* HP bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-cinzel tracking-wide text-[#5a4830]">
          <span>HP</span>
          <span>
            {hp} / {maxHp}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-black/40 border border-[rgba(239,68,68,0.1)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${hpPct}%`,
              background:
                hpPct > 50
                  ? "linear-gradient(90deg,#16a34a,#4ade80)"
                  : hpPct > 25
                    ? "linear-gradient(90deg,#d97706,#fbbf24)"
                    : "linear-gradient(90deg,#991b1b,#f87171)",
            }}
          />
        </div>
      </div>

      {/* Mana bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-cinzel tracking-wide text-[#5a4830]">
          <span>Mana</span>
          <span>
            {mana} / {maxMana}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-black/40 border border-[rgba(124,58,237,0.1)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${manaPct}%`,
              background: "linear-gradient(90deg,#6d28d9,#a78bfa)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function MobilePlayerChip({
  player,
  onKick,
}: {
  player: RoomDetail["players"][number];
  onKick?: () => void;
}) {
  return (
    <div className="shrink-0 flex items-center gap-2 rounded-xl border border-[rgba(200,169,110,0.12)] bg-[rgba(26,18,8,0.8)] px-3 py-2">
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${player.isConnected ? "bg-emerald-400" : "bg-[#5a4830]"}`}
      />
      <div>
        <div className="flex items-center gap-1.5">
          <p className="text-[12px] font-cinzel tracking-wide text-[#e8d5a3] whitespace-nowrap">
            {player.character?.name ?? "Unknown"}
          </p>
          <Badge className="border-[rgba(200,169,110,0.3)] bg-[rgba(200,169,110,0.1)] text-[#c8a96e] text-[10px] font-serif italic px-1.5 py-0">
            {player.role}
          </Badge>
        </div>
        <p className="text-[10px] font-serif italic text-[#5a4830] whitespace-nowrap">
          HP {player.character?.hp ?? "?"} · Mana{" "}
          {player.character?.mana ?? "?"}
        </p>
      </div>
      <span className="ml-auto text-[10px] font-cinzel tracking-wide text-[#8a6f3e]">
        <Button
          variant="ghost"
          className="p-0 h-6 w-6 rounded-lg border border-[rgba(90,72,48,0.2)] bg-black/30 text-[#5a4830] hover:bg-[rgba(90,72,48,0.1)] hover:text-[#8a6f3e] transition-all duration-150 cursor-pointer"
          onClick={onKick}
        >
          <X className="text-[#5a4830]" />
        </Button>
      </span>
    </div>
  );
}

export function ActionTypeButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-2.5 py-1 text-[11px] font-cinzel tracking-wide transition-all duration-150 cursor-pointer active:scale-95 ${
        active
          ? "border-[rgba(200,169,110,0.45)] bg-[rgba(200,169,110,0.12)] text-[#d4b87a]"
          : "border-[rgba(200,169,110,0.12)] bg-transparent text-[#5a4830] hover:border-[rgba(200,169,110,0.3)] hover:text-[#8a6f3e]"
      }`}
    >
      {label}
    </button>
  );
}

export function CombatDialog({
  open,
  onOpenChange,
  combatInput,
  handleCombatInput,
  onCombat,
}: CombatFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 border-0 bg-transparent shadow-none w-full max-w-lg max-h-[90vh]">
        <div
          className="w-full rounded-2xl border border-[rgba(200,169,110,0.3)] flex flex-col max-h-[90vh] overflow-hidden"
          style={{
            background: "linear-gradient(160deg,#1a1208,#0f0c06,#120d1a)",
            boxShadow: "0 0 60px rgba(0,0,0,0.6)",
          }}
        >
          <GoldBar />

          {/* ── Pinned header ── */}
          <div className="px-6 pt-5 pb-4 shrink-0">
            <DialogHeader className="space-y-1 mb-3">
              <DialogTitle className="text-xl font-cinzel tracking-wider text-[#e8d5a3]">
                Declare Your Attack
              </DialogTitle>

              <DialogDescription className="text-[13px] font-serif italic text-[#5a4830]">
                Choose your target and describe how your character strikes. The
                outcome of the attack will be determined by fate and the Dungeon
                Master's judgment.
              </DialogDescription>
            </DialogHeader>

            {/* Ornamental divider */}
            <OrnamentalDivider />
          </div>

          {/* ── Scrollable form body ── */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-6">
            <div className="flex flex-col gap-5 pb-4">
              {/* Character name */}
              <div>
                <CustomFieldLabel>Target</CustomFieldLabel>
                <Input
                  id="target"
                  type="text"
                  placeholder="Who do you wish to attack?"
                  value={combatInput.target}
                  onChange={(e) => handleCombatInput("target", e.target.value)}
                  className="rounded-xl border-[rgba(200,169,110,0.2)] bg-black/30 text-[#e8d5a3] placeholder:text-[#3a2a14] focus-visible:ring-0 focus-visible:border-[rgba(200,169,110,0.45)] font-serif italic text-sm"
                />
              </div>

              {/* Tell How */}
              <div>
                <CustomFieldLabel>How</CustomFieldLabel>
                <Input
                  id="how"
                  type="text"
                  placeholder="Describe your combat maneuver"
                  value={combatInput.how}
                  onChange={(e) => handleCombatInput("how", e.target.value)}
                  className="rounded-xl border-[rgba(200,169,110,0.2)] bg-black/30 text-[#e8d5a3] placeholder:text-[#3a2a14] focus-visible:ring-0 focus-visible:border-[rgba(200,169,110,0.45)] font-serif italic text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 p-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl border-[rgba(200,169,110,0.15)] bg-transparent font-cinzel text-sm tracking-wider text-[#5a4830] hover:border-[rgba(200,169,110,0.3)] hover:text-[#8a6f3e] hover:bg-transparent transition-all cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onCombat}
              disabled={!combatInput.target || !combatInput.how}
              className="flex-1 rounded-xl border border-[rgba(200,169,110,0.45)] font-cinzel text-sm tracking-wider text-[#e8d5a3] transition-all duration-200 hover:-translate-y-0.5 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              style={{
                background: "linear-gradient(135deg,#3d2e10,#2a1f0a)",
                boxShadow: "0 0 20px rgba(200,169,110,0.1)",
              }}
            >
              Roll The Dice
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function GameEventCard({ msg }: { msg: GameEventWithRelations }) {
  const payload = msg.payload as Record<string, unknown>;
  const characterName = msg.characters?.name ?? "Unknown";

  // ── AI Narration ──────────────────────────────────────────────────────────
  if (msg.eventType === "ai_narration") {
    return (
      <div className="rounded-xl border border-[rgba(167,139,250,0.2)] bg-[rgba(124,58,237,0.07)] p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-[12px] font-cinzel tracking-wide text-[#c4b5fd]">
            <span className="text-base">🎲</span>
            Dungeon Master
          </span>
          <span className="text-[10px] font-serif italic text-[#3a2a14] shrink-0">
            Turn {msg.turnNumber}
          </span>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap font-serif italic text-[#b8a8d8]">
          {String(payload.text ?? "")}
        </p>
      </div>
    );
  }

  // ── Player Action ─────────────────────────────────────────────────────────
  if (msg.eventType === "player_action") {
    return (
      <div className="rounded-xl border border-[rgba(200,169,110,0.15)] bg-[rgba(200,169,110,0.04)] p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-[12px] font-cinzel tracking-wide text-[#c8a96e]">
            <span className="text-base">⚔️</span>
            {characterName}
          </span>
          <span className="text-[10px] font-serif italic text-[#3a2a14] shrink-0">
            Turn {msg.turnNumber}
          </span>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap font-serif text-[#9a8878]">
          {String(payload.text ?? "")}
        </p>
      </div>
    );
  }

  // ── Combat ────────────────────────────────────────────────────────────────
  if (msg.eventType === "combat") {
    const roll = payload.diceRoll as number;
    const isCrit = roll >= 95;
    const isFail = roll <= 5;

    return (
      <div className="rounded-xl border border-[rgba(239,68,68,0.2)] bg-[rgba(153,27,27,0.08)] p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-[12px] font-cinzel tracking-wide text-[#f87171]">
            <span className="text-base">⚔️</span>
            {characterName}
            <span className="text-[#5a4830] font-serif italic normal-case tracking-normal">
              attacks
            </span>
          </span>
          <span className="text-[10px] font-serif italic text-[#3a2a14] shrink-0">
            Turn {msg.turnNumber}
          </span>
        </div>

        {/* Combat details */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          {/* How */}
          <div className="rounded-lg border border-[rgba(239,68,68,0.15)] bg-black/20 px-3 py-2 text-center">
            <p className="text-[10px] font-cinzel tracking-wide text-[#5a4830] mb-0.5">
              Action
            </p>
            <p className="text-[12px] font-serif italic text-[#e8d5a3] capitalize">
              {String(payload.how ?? "—")}
            </p>
          </div>

          {/* Arrow */}
          <svg viewBox="0 0 24 12" width="24" height="12" fill="none">
            <path
              d="M0 6h20M15 1l5 5-5 5"
              stroke="rgba(239,68,68,0.4)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Target */}
          <div className="rounded-lg border border-[rgba(239,68,68,0.15)] bg-black/20 px-3 py-2 text-center">
            <p className="text-[10px] font-cinzel tracking-wide text-[#5a4830] mb-0.5">
              Target
            </p>
            <p className="text-[12px] font-serif italic text-[#e8d5a3] capitalize">
              {String(payload.target ?? "—")}
            </p>
          </div>
        </div>

        {/* Dice roll result */}
        {roll !== undefined && (
          <div
            className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${
              isCrit
                ? "border-amber-400/30 bg-amber-400/08"
                : isFail
                  ? "border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.06)]"
                  : "border-[rgba(239,68,68,0.12)] bg-black/20"
            }`}
          >
            <span className="text-xl">🎲</span>
            <div>
              <p
                className={`text-[13px] font-cinzel tracking-wider ${
                  isCrit
                    ? "text-amber-400"
                    : isFail
                      ? "text-[#f87171]"
                      : "text-[#e8d5a3]"
                }`}
              >
                {isCrit ? "Critical Hit! " : isFail ? "Critical Fail! " : ""}
                {roll}
                <span className="text-[10px] text-[#3a2a14] font-serif italic tracking-normal normal-case ml-1">
                  / 100
                </span>
              </p>
              {isCrit && (
                <p className="text-[10px] font-serif italic text-amber-400/70">
                  Maximum damage dealt!
                </p>
              )}
              {isFail && (
                <p className="text-[10px] font-serif italic text-[#f87171]/70">
                  The attack misses entirely.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── End Game ─────────────────────────────────────────────────────────────
  if (msg.eventType === "game_end") {
    const title = payload.title as string | undefined;
    const reason = payload.reason as string | undefined;
    const summary = payload.summary as string | undefined;
    const narrative = payload.narrative as string | undefined;
    const isVictory = payload.reason === "victory";

    return (
      <div
        className={`rounded-xl border p-5 space-y-4 relative overflow-hidden ${
          isVictory
            ? "border-[rgba(52,211,153,0.3)] bg-[rgba(13,148,136,0.06)]"
            : "border-[rgba(239,68,68,0.3)] bg-[rgba(153,27,27,0.07)]"
        }`}
      >
        {/* Shimmer top bar */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: isVictory
              ? "linear-gradient(90deg,transparent,rgba(52,211,153,0.7),transparent)"
              : "linear-gradient(90deg,transparent,rgba(239,68,68,0.7),transparent)",
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`flex items-center gap-2 text-[12px] font-cinzel tracking-wide ${
              isVictory ? "text-[#34d399]" : "text-[#f87171]"
            }`}
          >
            <span className="text-base">{isVictory ? "👑" : "💀"}</span>
            {isVictory ? "Victory" : "Defeat"}
          </span>
          <span className="text-[10px] font-serif italic text-[#3a2a14] shrink-0">
            Turn {msg.turnNumber}
          </span>
        </div>

        {/* Title */}
        <div className="text-center space-y-1 py-2">
          <p
            className={`text-xs font-cinzel tracking-[0.2em] uppercase ${
              isVictory ? "text-[#0d9488]" : "text-[#7a3030]"
            }`}
          >
            {isVictory ? "✦ Quest Complete ✦" : "✗ Quest Failed ✗"}
          </p>
          <h3
            className={`text-base font-bold font-cinzel tracking-wide leading-snug ${
              isVictory ? "text-[#a7f3d0]" : "text-[#f8a0a0]"
            }`}
          >
            {title ?? "The End"}
          </h3>
        </div>

        {/* Ornamental divider */}
        <div className="flex items-center gap-3">
          <div
            className="flex-1 h-px"
            style={{
              background: isVictory
                ? "linear-gradient(90deg,transparent,rgba(52,211,153,0.2))"
                : "linear-gradient(90deg,transparent,rgba(239,68,68,0.15))",
            }}
          />
          <span
            className={`text-base ${isVictory ? "opacity-60" : "opacity-40"}`}
          >
            {isVictory ? "⚔" : "🕯"}
          </span>
          <div
            className="flex-1 h-px"
            style={{
              background: isVictory
                ? "linear-gradient(90deg,rgba(52,211,153,0.2),transparent)"
                : "linear-gradient(90deg,rgba(239,68,68,0.15),transparent)",
            }}
          />
        </div>

        {/* Narrative — the dramatic story close */}
        {narrative && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap font-serif italic text-[#b8a8d8]">
            {narrative}
          </p>
        )}

        {/* Summary box */}
        {summary && (
          <div
            className={`rounded-xl border px-4 py-3 space-y-1 ${
              isVictory
                ? "border-[rgba(52,211,153,0.12)] bg-[rgba(13,148,136,0.05)]"
                : "border-[rgba(239,68,68,0.12)] bg-[rgba(153,27,27,0.06)]"
            }`}
          >
            <p
              className={`text-[10px] font-cinzel tracking-widest uppercase ${
                isVictory ? "text-[#0d9488]" : "text-[#7a3030]"
              }`}
            >
              Chronicle
            </p>
            <p className="text-[13px] font-serif italic leading-relaxed text-[#b8b8b8]">
              {summary}
            </p>
          </div>
        )}

        {/* Bottom shimmer */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: isVictory
              ? "linear-gradient(90deg,transparent,rgba(200,169,110,0.5),transparent)"
              : "linear-gradient(90deg,transparent,rgba(239,68,68,0.4),transparent)",
          }}
        />
      </div>
    );
  }

  // ── Roll Dice ─────────────────────────────────────────────────────────────
  if (msg.eventType === "dice_roll") {
    const roll = payload.diceRoll as number;
    const event = payload.event as string;
    const isCrit = roll >= 95;
    const isFail = roll <= 5;

    return (
      <div className="rounded-xl border border-[rgba(167,139,250,0.15)] bg-[rgba(124,58,237,0.05)] p-4 space-y-2.5">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-[12px] font-cinzel tracking-wide text-[#c4b5fd]">
            <span className="text-base">🎲</span>
            {characterName}
            <span className="text-[#5a4830] font-serif italic normal-case tracking-normal">
              rolls
            </span>
          </span>
          <span className="text-[10px] font-serif italic text-[#3a2a14] shrink-0">
            Turn {msg.turnNumber}
          </span>
        </div>

        {/* Event context */}
        {event && (
          <p className="text-[12px] font-serif italic text-[#7a6548] px-1">
            "{event}"
          </p>
        )}

        {/* Roll result */}
        <div
          className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
            isCrit
              ? "border-amber-400/30 bg-[rgba(251,191,36,0.06)]"
              : isFail
                ? "border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.05)]"
                : "border-[rgba(167,139,250,0.15)] bg-black/20"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 font-cinzel font-bold text-sm ${
              isCrit
                ? "border-amber-400/50 text-amber-400"
                : isFail
                  ? "border-[rgba(248,113,113,0.5)] text-[#f87171]"
                  : "border-[rgba(167,139,250,0.4)] text-[#c4b5fd]"
            }`}
          >
            {roll}
          </div>
          <div>
            <p
              className={`text-[12px] font-cinzel tracking-wide ${
                isCrit
                  ? "text-amber-400"
                  : isFail
                    ? "text-[#f87171]"
                    : "text-[#c4b5fd]"
              }`}
            >
              {isCrit
                ? "✦ Critical Success"
                : isFail
                  ? "✗ Critical Failure"
                  : `Rolled ${roll}`}
            </p>
            <p className="text-[10px] font-serif italic text-[#3a2a14]">
              out of 100
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Fallback for unknown types ─────────────────────────────────────────────
  return (
    <div className="rounded-xl border border-[rgba(200,169,110,0.1)] bg-black/20 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-cinzel tracking-wide text-[#5a4830] capitalize">
          {String(msg.eventType).replace(/_/g, " ")}
        </span>
        <span className="text-[10px] font-serif italic text-[#3a2a14]">
          Turn {msg.turnNumber}
        </span>
      </div>
      <p className="text-xs font-serif italic text-[#5a4830]">
        {JSON.stringify(payload)}
      </p>
    </div>
  );
}
