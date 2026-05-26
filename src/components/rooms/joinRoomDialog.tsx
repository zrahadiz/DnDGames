"use client";

import { useState } from "react";
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

// ─── Types ────────────────────────────────────────────────────────────────────
interface RaceSuggestion {
  name: string;
  description: string;
}

interface ClassSuggestion {
  name: string;
  description: string;
}

interface CharacterSuggestions {
  races: RaceSuggestion[];
  classes: ClassSuggestion[];
}

interface JoinRoomInput {
  character_name: string;
  character_races: string;
  character_class: string;
}

interface JoinRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  joinRoomInput: JoinRoomInput;
  handleJoinRoomInput: (key: keyof JoinRoomInput, value: string) => void;
  onJoin: () => void;
  suggestions: CharacterSuggestions | null;
}

// ─── Option card inside dropdown ──────────────────────────────────────────────
function OptionCard({
  item,
  selected,
  onSelect,
}: {
  item: RaceSuggestion | ClassSuggestion;
  selected: boolean;
  onSelect: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={`rounded-xl border transition-all duration-150 overflow-hidden ${
        selected
          ? "border-[rgba(200,169,110,0.5)] bg-[rgba(200,169,110,0.08)]"
          : "border-[rgba(200,169,110,0.1)] bg-black/20 hover:border-[rgba(200,169,110,0.25)]"
      }`}
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        {/* Select radio */}
        <button
          type="button"
          onClick={onSelect}
          className={`w-4 h-4 rounded-full border-2 shrink-0 transition-all ${
            selected
              ? "border-[rgba(200,169,110,0.7)] bg-[rgba(200,169,110,0.5)]"
              : "border-[rgba(200,169,110,0.25)] bg-transparent hover:border-[rgba(200,169,110,0.45)]"
          }`}
          aria-label={`Select ${item.name}`}
        />

        {/* Name */}
        <span
          className={`flex-1 font-cinzel text-[13px] tracking-wide cursor-pointer ${
            selected ? "text-[#e8d5a3]" : "text-[#8a6f3e]"
          }`}
          onClick={onSelect}
        >
          {item.name}
        </span>

        {/* Info toggle */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[rgba(200,169,110,0.15)] text-[#5a4830] transition-all hover:border-[rgba(200,169,110,0.3)] hover:text-[#8a6f3e]"
          aria-label="Toggle description"
        >
          <svg
            viewBox="0 0 12 12"
            width="10"
            height="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          >
            <path d="M2 4l4 4 4-4" />
          </svg>
        </button>
      </div>

      {/* Description */}
      {expanded && (
        <div className="px-3 pb-3 pt-0">
          <p className="text-[12px] font-serif italic leading-relaxed text-[#6a5838] border-t border-[rgba(200,169,110,0.08)] pt-2">
            {item.description}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Scrollable option list ───────────────────────────────────────────────────
function OptionList({
  items,
  selected,
  onSelect,
  emptyText,
}: {
  items: (RaceSuggestion | ClassSuggestion)[];
  selected: string;
  onSelect: (name: string) => void;
  emptyText: string;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-[rgba(200,169,110,0.15)] bg-black/10 py-6 text-center">
        <span className="text-2xl opacity-30">📜</span>
        <p className="text-xs italic font-serif text-[#5a4830]">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar pr-0.5">
      {items.map((item) => (
        <OptionCard
          key={item.name}
          item={item}
          selected={selected === item.name}
          onSelect={() => onSelect(item.name)}
        />
      ))}
    </div>
  );
}

// ─── Main dialog ──────────────────────────────────────────────────────────────
export default function JoinRoomDialog({
  open,
  onOpenChange,
  joinRoomInput,
  handleJoinRoomInput,
  onJoin,
  suggestions,
}: JoinRoomDialogProps) {
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
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl font-cinzel tracking-wider text-[#e8d5a3]">
                Forge Your Hero
              </DialogTitle>
              <DialogDescription className="text-[13px] font-serif italic text-[#5a4830]">
                Choose your name, lineage, and calling before you enter the
                realm.
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
                <CustomFieldLabel>Hero Name</CustomFieldLabel>
                <Input
                  id="character_name"
                  type="text"
                  placeholder="What shall the bards call you?"
                  value={joinRoomInput.character_name}
                  onChange={(e) =>
                    handleJoinRoomInput("character_name", e.target.value)
                  }
                  className="rounded-xl border-[rgba(200,169,110,0.2)] bg-black/30 text-[#e8d5a3] placeholder:text-[#3a2a14] focus-visible:ring-0 focus-visible:border-[rgba(200,169,110,0.45)] font-serif italic text-sm"
                />
              </div>

              {/* Race selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <CustomFieldLabel>Race / Lineage</CustomFieldLabel>
                  {joinRoomInput.character_races && (
                    <span className="text-[11px] font-cinzel tracking-wide text-[#c8a96e]">
                      ✦ {joinRoomInput.character_races}
                    </span>
                  )}
                </div>
                <OptionList
                  items={suggestions?.races ?? []}
                  selected={joinRoomInput.character_races}
                  onSelect={(value) =>
                    handleJoinRoomInput("character_races", value)
                  }
                  emptyText="No race suggestions available."
                />
              </div>

              {/* Divider between race and class */}
              <div
                className="h-px w-full"
                style={{
                  background:
                    "linear-gradient(90deg,transparent,rgba(200,169,110,0.12),transparent)",
                }}
              />

              {/* Class selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <CustomFieldLabel>Class / Calling</CustomFieldLabel>
                  {joinRoomInput.character_class && (
                    <span className="text-[11px] font-cinzel tracking-wide text-[#c4b5fd]">
                      ✦ {joinRoomInput.character_class}
                    </span>
                  )}
                </div>

                <OptionList
                  items={suggestions?.classes ?? []}
                  selected={joinRoomInput.character_class}
                  onSelect={(value) =>
                    handleJoinRoomInput("character_class", value)
                  }
                  emptyText="No class suggestions available."
                />
              </div>
            </div>
          </div>

          {/* ── Pinned footer ── */}
          <div
            className="px-6 py-4 shrink-0"
            style={{ borderTop: "1px solid rgba(200,169,110,0.1)" }}
          >
            {/* Selection summary */}
            {(joinRoomInput.character_races ||
              joinRoomInput.character_class) && (
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {joinRoomInput.character_races && (
                  <span className="rounded-full border border-[rgba(200,169,110,0.2)] bg-[rgba(200,169,110,0.07)] px-2.5 py-1 text-[11px] font-cinzel tracking-wide text-[#8a6f3e]">
                    {joinRoomInput.character_races}
                  </span>
                )}
                {joinRoomInput.character_races &&
                  joinRoomInput.character_class && (
                    <span className="text-[#3a2a14] text-xs">·</span>
                  )}
                {joinRoomInput.character_class && (
                  <span className="rounded-full border border-[rgba(167,139,250,0.2)] bg-[rgba(124,58,237,0.07)] px-2.5 py-1 text-[11px] font-cinzel tracking-wide text-[#9a85c4]">
                    {joinRoomInput.character_class}
                  </span>
                )}
              </div>
            )}

            <div className="flex gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 rounded-xl border-[rgba(200,169,110,0.15)] bg-transparent font-cinzel text-sm tracking-wider text-[#5a4830] hover:border-[rgba(200,169,110,0.3)] hover:text-[#8a6f3e] hover:bg-transparent transition-all cursor-pointer"
              >
                Retreat
              </Button>
              <Button
                type="button"
                onClick={onJoin}
                disabled={
                  !joinRoomInput.character_name ||
                  !joinRoomInput.character_races ||
                  !joinRoomInput.character_class
                }
                className="flex-1 rounded-xl border border-[rgba(200,169,110,0.45)] font-cinzel text-sm tracking-wider text-[#e8d5a3] transition-all duration-200 hover:-translate-y-0.5 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                style={{
                  background: "linear-gradient(135deg,#3d2e10,#2a1f0a)",
                  boxShadow: "0 0 20px rgba(200,169,110,0.1)",
                }}
              >
                ⚔ Enter the Realm
              </Button>
            </div>
          </div>

          <GoldBar />
        </div>
      </DialogContent>
    </Dialog>
  );
}
