"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import GoldBar from "@/components/ornaments/goldBar";
import CampaignRowCard from "@/components/campaigns/CampaignRowCard";

import { CampaignWithRelations } from "@/types/campaigns";

import api from "@/lib/axios";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SelectCampaignDialogProps {
  open: boolean;
  selectedCampaignId: string | null;
  onClose: () => void;
  onSelect: (campaign: CampaignWithRelations) => void;
}

// ─── Main dialog ──────────────────────────────────────────────────────────────
export default function CampaignPickerDialog({
  open,
  selectedCampaignId,
  onClose,
  onSelect,
}: SelectCampaignDialogProps) {
  const [search, setSearch] = useState("");
  const [campaigns, setCampaigns] = useState<CampaignWithRelations[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "8",
        ...(search ? { search } : {}),
      });
      const { data } = await api.get(`/campaigns?${params}`);
      setCampaigns(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  // Re-fetch when search/page changes (debounced for search)
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(fetchCampaigns, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [open, fetchCampaigns, search]);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSearch("");
      setPage(1);
      setExpandedId(null);
    }
  }, [open]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSelect = (campaign: CampaignWithRelations) => {
    onSelect(campaign);
    onClose();
  };

  const handleToggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="p-0 gap-0 border-0 bg-transparent shadow-none w-full max-w-lg sm:max-w-2xl max-h-[90vh]">
        <div
          className="w-full rounded-2xl border border-[rgba(200,169,110,0.3)] flex flex-col max-h-[90vh] overflow-hidden"
          style={{
            background: "linear-gradient(160deg,#1a1208,#0f0c06,#120d1a)",
            boxShadow: "0 0 60px rgba(0,0,0,0.6)",
          }}
        >
          <GoldBar />

          {/* ── Pinned header ── */}
          <div className="px-5 pt-5 pb-4 shrink-0 space-y-4">
            <DialogHeader className="flex-row items-center justify-between space-y-0">
              <DialogTitle className="text-lg font-cinzel tracking-wider text-[#e8d5a3]">
                Choose a Campaign
              </DialogTitle>
              <button
                type="button"
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

            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2"
                viewBox="0 0 16 16"
                width="14"
                height="14"
                fill="none"
                stroke="rgba(200,169,110,0.4)"
                strokeWidth="1.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="6.5" cy="6.5" r="4.5" />
                <path d="M14 14l-3-3" />
              </svg>
              <Input
                value={search}
                onChange={handleSearchChange}
                placeholder="Search campaigns…"
                className="pl-9 rounded-xl border-[rgba(200,169,110,0.2)] bg-black/30 text-[#e8d5a3] placeholder:text-[#3a2a14] focus-visible:ring-0 focus-visible:border-[rgba(200,169,110,0.45)] font-serif text-sm"
              />
            </div>

            {/* Result count */}
            {pagination && (
              <p className="text-[11px] italic font-serif text-[#3a2a14]">
                {pagination.total}{" "}
                {pagination.total === 1 ? "campaign" : "campaigns"} found
              </p>
            )}
          </div>

          {/* ── Scrollable campaign list ── */}
          <div className="flex-1 overflow-y-auto px-5 no-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <div className="h-8 w-8 rounded-full border-2 border-[rgba(200,169,110,0.2)] border-t-[rgba(200,169,110,0.7)] animate-spin" />
                <p className="text-sm italic font-serif text-[#5a4830]">
                  Consulting the ancient archives…
                </p>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <span className="text-3xl opacity-40">📜</span>
                <p className="text-sm font-cinzel text-[#5a4830]">
                  No campaigns found
                </p>
                <p className="text-xs italic font-serif text-[#3a2a14]">
                  Try a different search term.
                </p>
              </div>
            ) : (
              <div className="space-y-2 pb-4">
                {campaigns.map((c) => (
                  <CampaignRowCard
                    key={c.id}
                    campaign={c}
                    isSelected={selectedCampaignId === c.id}
                    isExpanded={expandedId === c.id}
                    onToggleExpand={() => handleToggleExpand(c.id)}
                    onSelect={() => handleSelect(c)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Pinned pagination footer ── */}
          {pagination && pagination.totalPages > 1 && (
            <div
              className="px-5 py-3 shrink-0 flex items-center justify-between"
              style={{ borderTop: "1px solid rgba(200,169,110,0.1)" }}
            >
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-[rgba(200,169,110,0.15)] bg-transparent px-3 py-1.5 text-[11px] font-cinzel tracking-wider text-[#5a4830] transition-all hover:border-[rgba(200,169,110,0.35)] hover:text-[#8a6f3e] disabled:opacity-30 disabled:pointer-events-none"
              >
                ← Prev
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === pagination.totalPages ||
                      Math.abs(p - page) <= 1,
                  )
                  .reduce<(number | "...")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1)
                      acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span
                        key={`ellipsis-${i}`}
                        className="text-[11px] text-[#3a2a14] px-1"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p as number)}
                        className={`h-7 w-7 rounded-lg text-[11px] font-cinzel transition-all ${
                          p === page
                            ? "border border-[rgba(200,169,110,0.45)] bg-[rgba(200,169,110,0.12)] text-[#d4b87a] pointer-events-none"
                            : "border border-[rgba(200,169,110,0.12)] bg-transparent text-[#5a4830] hover:border-[rgba(200,169,110,0.3)] hover:text-[#8a6f3e]"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={page === pagination.totalPages}
                className="rounded-lg border border-[rgba(200,169,110,0.15)] bg-transparent px-3 py-1.5 text-[11px] font-cinzel tracking-wider text-[#5a4830] transition-all hover:border-[rgba(200,169,110,0.35)] hover:text-[#8a6f3e] disabled:opacity-30 disabled:pointer-events-none"
              >
                Next →
              </button>
            </div>
          )}

          <GoldBar />
        </div>
      </DialogContent>
    </Dialog>
  );
}
