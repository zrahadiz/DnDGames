import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import GoldBar from "../ornaments/goldBar";
import Divider from "../ornaments/divider";
import type { CampaignForm, CampaignWithRelation } from "@/types/campaigns";
import { Button } from "../ui/button";
import { ThemeSelector } from "../forms/themeSelector";
import { Input } from "../ui/input";

// ─── Reusable field sub-components ───────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] mb-1.5 font-cinzel tracking-[0.08em] text-[#8a6f3e]">
      {children}
    </label>
  );
}

const inputCls =
  "w-full px-3 py-2 rounded-xl text-[13px] font-serif outline-none transition-colors " +
  "bg-black/30 border border-[rgba(200,169,110,0.2)] text-[#e8d5a3] " +
  "focus:border-[rgba(200,169,110,0.45)] placeholder:text-[#5a4830]";

// ─── Component ────────────────────────────────────────────────────────────────
export default function CampaignModal({
  campaign,
  onClose,
  onSave,
}: {
  campaign?: CampaignWithRelation;
  onClose: () => void;
  onSave: ({
    form,
    id,
  }: {
    form: CampaignForm;
    id?: string;
    isEdit?: boolean;
  }) => void;
}) {
  const isEdit = !!campaign;

  const [form, setForm] = useState({
    title: campaign?.title ?? "",
    theme: campaign?.theme ?? null,
    description: campaign?.description ?? "",
    backgroundLore: campaign?.backgroundLore ?? "",
    startingObjective: campaign?.startingObjective ?? "",
    startingLocation: campaign?.startingLocation ?? "",
    worldSetup: campaign?.worldSetup
      ? Object.entries(campaign.worldSetup).map(([key, value], index) => ({
          id: `${key}-${index}`,

          key,

          value: String(value),
        }))
      : [],
    isOfficial: campaign?.isOfficial ?? false,
  });

  const setField = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const addWorldSetupField = () => {
    setForm((prev) => ({
      ...prev,

      worldSetup: [
        ...prev.worldSetup,

        {
          id: crypto.randomUUID(),

          key: "",

          value: "",
        },
      ],
    }));
  };

  const removeWorldSetupField = (id: string) => {
    setForm((prev) => ({
      ...prev,

      worldSetup: prev.worldSetup.filter((item) => item.id !== id),
    }));
  };

  const updateWorldSetupField = (
    id: string,

    field: "key" | "value",

    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,

      worldSetup: prev.worldSetup.map((item) =>
        item.id === id
          ? {
              ...item,

              [field]: value,
            }
          : item,
      ),
    }));
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="p-0 gap-0 border-0 bg-transparent shadow-none w-full max-w-lg sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh]">
        <div
          className="w-full rounded-2xl border border-[rgba(200,169,110,0.3)] flex flex-col max-h-[90vh] overflow-hidden"
          style={{
            background: "linear-gradient(160deg,#1a1208,#0f0c06,#120d1a)",
            boxShadow: "0 0 60px rgba(0,0,0,0.6)",
          }}
        >
          {/* ── Top bar ── */}
          <GoldBar />

          {/* ── Pinned header ── */}
          <div className="px-6 pt-5 pb-4 shrink-0">
            <DialogHeader className="flex-row items-center justify-between space-y-0 mb-4">
              <DialogTitle className="text-xl font-cinzel tracking-wider text-[#e8d5a3]">
                {isEdit ? "Edit Campaign" : "Forge New Campaign"}
              </DialogTitle>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg border border-[rgba(200,169,110,0.2)] bg-transparent text-[#8a6f3e] cursor-pointer hover:border-[rgba(200,169,110,0.4)] transition-colors"
              >
                <svg
                  viewBox="0 0 16 16"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M2 2l12 12M14 2L2 14" />
                </svg>
              </button>
            </DialogHeader>
            <Divider />
          </div>

          {/* ── Scrollable form body ── */}
          <div className="px-6 flex-1 overflow-y-auto no-scrollbar">
            <div className="flex flex-col gap-4 pb-4">
              {/* Form grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <FieldLabel>Campaign Title</FieldLabel>
                  <input
                    className={inputCls}
                    value={form.title}
                    onChange={(e) => setField("title", e.target.value)}
                    placeholder="Enter campaign title…"
                  />
                </div>

                <div className="sm:col-span-2">
                  <FieldLabel>Description</FieldLabel>
                  <textarea
                    className={`${inputCls} resize-none`}
                    rows={3}
                    value={form.description}
                    onChange={(e) => setField("description", e.target.value)}
                    placeholder="A brief summary of the campaign…"
                  />
                </div>

                <div className="sm:col-span-2">
                  <FieldLabel>Themes</FieldLabel>
                  <ThemeSelector
                    selectedTheme={form.theme}
                    onChange={(theme) => setField("theme", theme)}
                    allowCustomAdd={true}
                  />
                </div>

                <div className="sm:col-span-2">
                  <FieldLabel>Background Lore</FieldLabel>
                  <textarea
                    className={`${inputCls} resize-none`}
                    rows={3}
                    value={form.backgroundLore}
                    onChange={(e) => setField("backgroundLore", e.target.value)}
                    placeholder="The history and lore behind this world…"
                  />
                </div>

                <div className="sm:col-span-2">
                  <FieldLabel>Starting Objective</FieldLabel>
                  <textarea
                    className={`${inputCls} resize-none`}
                    rows={2}
                    value={form.startingObjective}
                    onChange={(e) =>
                      setField("startingObjective", e.target.value)
                    }
                    placeholder="What must the party accomplish first?"
                  />
                </div>

                <div className="sm:col-span-2">
                  <FieldLabel>Starting Location</FieldLabel>
                  <textarea
                    className={`${inputCls} resize-none`}
                    rows={2}
                    value={form.startingLocation}
                    onChange={(e) =>
                      setField("startingLocation", e.target.value)
                    }
                    placeholder="Where the party first summoned?"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <FieldLabel>World Setup</FieldLabel>
                  </div>

                  <div className="rounded-xl border border-dashed border-[rgba(200,169,110,0.15)] bg-black/10 p-5 text-center text-sm italic text-[#5a4830] font-serif">
                    {form.worldSetup.length === 0 ? (
                      <p>
                        No world setup yet — add fields to define your realm.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {form.worldSetup.map((item) => (
                          <div
                            key={item.id}
                            className="group grid grid-cols-1 gap-2 rounded-xl border border-[rgba(200,169,110,0.1)] bg-black/15 p-3 transition-all hover:border-[rgba(200,169,110,0.25)] md:grid-cols-[1fr_1.5fr_auto]"
                          >
                            <Input
                              placeholder="e.g. Setting, Era, Power System"
                              value={item.key}
                              onChange={(e) =>
                                updateWorldSetupField(
                                  item.id,
                                  "key",
                                  e.target.value,
                                )
                              }
                              className="h-8 rounded-lg border-[rgba(200,169,110,0.2)] bg-black/20 text-[13px] text-[#e8d5a3] placeholder:text-[#3a2a14] focus-visible:ring-0 focus-visible:border-[rgba(200,169,110,0.45)] font-cinzel tracking-wide"
                            />
                            <Input
                              placeholder="Field value"
                              value={item.value}
                              onChange={(e) =>
                                updateWorldSetupField(
                                  item.id,
                                  "value",
                                  e.target.value,
                                )
                              }
                              className="h-8 rounded-lg border-[rgba(200,169,110,0.2)] bg-black/20 text-[13px] text-[#e8d5a3] placeholder:text-[#3a2a14] focus-visible:ring-0 focus-visible:border-[rgba(200,169,110,0.45)] font-serif italic"
                            />
                            <button
                              type="button"
                              onClick={() => removeWorldSetupField(item.id)}
                              className="flex items-center justify-center rounded-lg border border-[rgba(239,68,68,0.15)] bg-transparent px-3 py-2 text-[#f87171]/40 transition-all hover:border-[rgba(239,68,68,0.35)] hover:bg-[rgba(239,68,68,0.07)] hover:text-[#f87171] active:scale-95 opacity-0 group-hover:opacity-100"
                            >
                              <svg
                                viewBox="0 0 16 16"
                                width="13"
                                height="13"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              >
                                <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={addWorldSetupField}
                      className="mt-5 rounded-lg border border-[rgba(200,169,110,0.25)] bg-[rgba(200,169,110,0.08)] px-3 py-1.5 text-[11px] font-cinzel tracking-wide text-[#d4b87a] transition-all hover:bg-[rgba(200,169,110,0.14)] hover:border-[rgba(200,169,110,0.4)] active:scale-95"
                    >
                      + Add Field
                    </button>
                  </div>
                </div>
              </div>

              {/* Publish toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.isOfficial}
                  onClick={() =>
                    setForm((f) => ({ ...f, isOfficial: !f.isOfficial }))
                  }
                  className="relative w-10 h-[22px] rounded-full flex-shrink-0 cursor-pointer transition-colors duration-200 border border-[rgba(200,169,110,0.3)]"
                  style={{
                    background: form.isOfficial
                      ? "rgba(200,169,110,0.45)"
                      : "rgba(255,255,255,0.08)",
                  }}
                >
                  <span
                    className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[#e8d5a3] transition-transform duration-200"
                    style={{
                      transform: form.isOfficial
                        ? "translateX(18px)"
                        : "translateX(0)",
                    }}
                  />
                </button>
                <span className="text-sm italic font-serif text-[#8a6f3e]">
                  Publish to community
                </span>
              </div>
            </div>
          </div>

          {/* ── Pinned footer ── */}
          <div
            className="px-6 py-4 shrink-0"
            style={{ borderTop: "1px solid rgba(200,169,110,0.12)" }}
          >
            <GoldBar />
            <DialogFooter className="pt-4">
              <div className="flex gap-2.5 w-full">
                <Button
                  onClick={onClose}
                  className="flex-1 rounded-xl text-sm font-cinzel tracking-wide cursor-pointer transition-all bg-transparent border border-[rgba(200,169,110,0.2)] text-[#8a6f3e] hover:border-[rgba(200,169,110,0.4)] hover:text-[#c8a96e]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    onSave({
                      form,
                      id: campaign?.id,
                      isEdit,
                    })
                  }
                  className="flex-1 rounded-xl text-sm font-semibold font-cinzel tracking-wide cursor-pointer transition-all duration-200 hover:-translate-y-0.5 border border-[rgba(200,169,110,0.45)] text-[#e8d5a3]"
                  style={{
                    background: "linear-gradient(135deg,#3d2e10,#2a1f0a)",
                    boxShadow: "0 0 20px rgba(200,169,110,0.1)",
                  }}
                >
                  {isEdit ? "Save Changes" : "Forge Campaign"}
                </Button>
              </div>
            </DialogFooter>
          </div>

          {/* ── Bottom bar ── */}
          <GoldBar />
        </div>
      </DialogContent>
    </Dialog>
  );
}
