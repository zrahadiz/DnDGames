"use client";

import { useState, useMemo, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import Divider from "@/components/ornaments/divider";
import type { Campaign } from "@/types/campaigns";
import api from "@/lib/axios";
import CampaignCard from "@/components/campaigns/campaignCard";
import CampaignModal from "@/components/campaigns/campaignModal";

import PageBg from "@/components/layout/pageBackground";
import { PlusIcon, SearchIcon } from "lucide-react";
import DeleteModal from "@/components/campaigns/deleteModal";

const THEMES = [
  "all",
  "epic-fantasy",
  "horror",
  "sci-fi",
  "intrigue",
  "steampunk",
  "fey",
  "western",
  "post-apocalyptic",
];

const ICONS: Record<string, string> = {
  "epic-fantasy": "⚔️",
  horror: "🩸",
  "sci-fi": "🚀",
  intrigue: "🗡️",
  steampunk: "⚙️",
  fey: "🌿",
  western: "🤠",
  "post-apocalyptic": "☢️",
};

export default function CampaignsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "current-user";
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const [search, setSearch] = useState("");
  const [themeFilter, setThemeFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Campaign | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);

  const getCampaigns = async () => {
    const { data } = await api.get("campaigns", {
      params: {
        search,
        theme: themeFilter,
        page,
        limit,
      },
    });
    console.log(data);
    setCampaigns(data.data);
  };

  useEffect(() => {
    getCampaigns();
  }, []);

  const handleSave = (data: Record<string, unknown>) => {
    if (editTarget) {
      setEditTarget(null);
    } else {
      setCreateOpen(false);
    }
  };

  type FilterButtonProps = {
    value: string;
    current: string;
    onClick: () => void;
    children: React.ReactNode;
  };

  function FilterButton({
    value,
    current,
    onClick,
    children,
  }: FilterButtonProps) {
    const active = current === value;

    return (
      <button
        onClick={onClick}
        className={`rounded-lg border px-3 py-1.5 font-['Cinzel',serif] text-[11px] tracking-[0.06em] transition-all duration-150 active:scale-[0.98]${
          active
            ? `border-[rgba(200,169,110,0.45)] bg-[rgba(200,169,110,0.15)] text-[#d4b87a] shadow-[0_0_16px_rgba(200,169,110,0.08)]`
            : `border-[rgba(200,169,110,0.15)] text-[#ae9d88]
 hover:border-[rgba(200,169,110,0.3)] hover:bg-[rgba(200,169,110,0.05)] hover:text-[#b8995a]`
        }`}
      >
        {children}
      </button>
    );
  }

  const filters = [
    {
      label: "Owner",
      current: ownerFilter,
      set: setOwnerFilter,

      options: [
        ["all", "All Campaigns"],
        ["official", "✦ Official"],
        ["community", "Community"],
        ["mine", "My Campaigns"],
      ],
    },
    {
      label: "Theme",
      current: themeFilter,
      set: setThemeFilter,

      options: THEMES.map((t) => [
        t,
        t === "all" ? "All Themes" : `${ICONS[t] ?? "🎲"} ${t}`,
      ]),
    },
  ];
  return (
    <>
      <div className="min-h-screen px-6 py-20">
        <PageBg />
        <header className="border-b border-[rgba(200,169,110,0.1)] pt-20 pb-10 text-center">
          <p className="mb-2.5 font-serif text-[10px] uppercase tracking-[0.3em] text-[#8a6f3e]">
            ✦ The Codex ✦
          </p>
          <h1 className="mb-2.5 font-['Cinzel',serif] text-[clamp(28px,5vw,48px)] font-bold tracking-[0.06em] text-[#e8d5a3] drop-shadow-[0_0_40px_rgba(200,169,110,0.25)]">
            Campaign Codex
          </h1>

          <p className="mx-auto mb-5 max-w-[480px] font-serif text-sm italic text-[#7a6548]">
            Discover worlds forged by the community, or pen your own legend for
            others to explore.
          </p>

          <Divider />

          <button
            onClick={() => setCreateOpen(true)}
            className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-[14px] border border-[rgba(200,169,110,0.45)] bg-[linear-gradient(135deg,#3d2e10,#2a1f0a)] px-6 py-3 font-['Cinzel',serif] text-sm font-semibold tracking-[0.08em] text-[#e8d5a3] shadow-[0_0_24px_rgba(200,169,110,0.1)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_32px_rgba(200,169,110,0.2)] active:scale-[0.98]"
          >
            <PlusIcon />
            Forge New Campaign
          </button>
        </header>
        <main className="mx-auto max-w-[1280px] px-5 py-8">
          <div className="mb-5 flex flex-wrap gap-3">
            <div className="relative min-w-[200px] flex-1">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search campaigns…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-[rgba(200,169,110,0.2)] bg-[rgba(26,18,8,0.8)] py-2.5 pr-4 pl-9 font-serif text-[13px] text-[#e8d5a3] outline-none transition-all placeholder:text-[#6f5a39] focus:border-[rgba(200,169,110,0.45)] focus:ring-2 focus:ring-[rgba(200,169,110,0.15)]"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="mb-7 flex flex-col gap-4 rounded-[14px] border border-[rgba(200,169,110,0.1)] bg-[rgba(26,18,8,0.6)] p-4">
            {filters.map((filter) => (
              <div key={filter.label}>
                <p className="mb-2 font-serif text-[11px] italic text-[#5a4830]">
                  Filter by {filter.label.toLowerCase()}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {filter.options.map(([v, l]) => (
                    <FilterButton
                      key={v}
                      value={v}
                      current={filter.current}
                      onClick={() => filter.set(v)}
                    >
                      {l}
                    </FilterButton>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Result count */}
          <p className="mb-5 font-serif text-xs italic text-[#5a4830]">
            {campaigns.length}{" "}
            {campaigns.length === 1 ? "campaign" : "campaigns"} found
          </p>

          {/* Empty state */}
          {campaigns.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mb-4 text-[40px]">📜</div>

              <p className=" font-['Cinzel',serif] text-lg text-[#5a4830]">
                No campaigns found
              </p>

              <p className=" mt-2 font-serif text-[13px] italic text-[#3a2a14]">
                Try different filters, or forge your own.
              </p>
            </div>
          ) : (
            <div className=" grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
              {campaigns.map((c) => (
                <CampaignCard
                  key={c.id}
                  campaign={c}
                  isOwner={c.createdBy === userId}
                  onEdit={setEditTarget}
                  onDelete={setDeleteTarget}
                  onPlay={(c) => console.log("play", c.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {createOpen && (
        <CampaignModal
          onClose={() => setCreateOpen(false)}
          onSave={handleSave}
        />
      )}
      {editTarget && (
        <CampaignModal
          campaign={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleSave}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          campaign={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            setCampaigns((p) => p.filter((c) => c.id !== deleteTarget.id));
            setDeleteTarget(null);
          }}
        />
      )}
    </>
  );
}
