"use client";

import { useState, useEffect } from "react";
import Divider from "@/components/ornaments/divider";
import type { CampaignForm, CampaignWithRelations } from "@/types/campaigns";
import api from "@/lib/axios";
import CampaignCard from "@/components/campaigns/campaignCard";
import CampaignModal from "@/components/campaigns/campaignModal";
import { PlusIcon, SearchIcon } from "lucide-react";
import DeleteModal from "@/components/campaigns/deleteModal";
import { ThemeSelector } from "@/components/forms/themeSelector";
import { ThemeOption } from "@/types/theme";
import { useAuthStore } from "@/stores/auth-store";
import Loading from "@/components/feedback/loading";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignWithRelations[]>([]);
  const { user, fetchUser } = useAuthStore();
  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState<ThemeOption | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CampaignWithRelations | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] =
    useState<CampaignWithRelations | null>(null);

  const getCampaigns = async () => {
    console.time("fetch campaigns");
    setLoadingState(true);
    setLoadingText("Getting Campaigns...");
    try {
      const { data } = await api.get("campaigns", {
        params: {
          search,
          theme: theme?.id,
          page,
          limit,
        },
      });
      console.timeEnd("fetch campaigns");
      console.log(data);
      setCampaigns(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error(error);
      toast(getErrorMessage(error), {
        type: "error",
      });
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  useEffect(() => {
    getCampaigns();
  }, [search, theme, page, limit]);

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, []);

  const saveCampaign = async ({
    form,
    id,
    isEdit = false,
  }: {
    form: CampaignForm;
    id?: string;
    isEdit?: boolean;
  }) => {
    setLoadingState(true);
    setLoadingText(isEdit ? "Updating Campaign..." : "Creating Campaign...");
    try {
      const { theme, worldSetup, ...rest } = form;
      const payload = {
        ...rest,
        themeId: theme?.id,
        worldSetup: Object.fromEntries(
          worldSetup
            .filter((item) => item.key.trim() && item.value.trim())
            .map((item) => [item.key, item.value]),
        ),
      };
      console.log("payload: ", payload);
      const { data } = isEdit
        ? await api.patch(`/campaigns/${id}`, payload)
        : await api.post("/campaigns", payload);

      console.log("resp:", data);
      if (isEdit) {
        setEditTarget(null);
      } else {
        setCreateOpen(false);
      }
      getCampaigns();
      toast(
        isEdit
          ? "Campaign Updated successfully"
          : "Campaign Created successfully",
        {
          type: "success",

          position: "top-center",

          duration: 5000,
        },
      );
    } catch (error) {
      console.error(error);
      toast(getErrorMessage(error), {
        type: "error",
      });
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const deleteCampaign = async ({
    campaign,
  }: {
    campaign: CampaignWithRelations;
  }) => {
    setLoadingState(true);
    setLoadingText("Deleting Campaign...");
    try {
      await api.delete(`/campaigns/${campaign.id}`);
      setDeleteTarget(null);
      getCampaigns();
      toast("Campaign Deleted successfully", {
        type: "success",
        position: "top-center",
        duration: 5000,
      });
    } catch (error) {
      console.error(error);
      toast(getErrorMessage(error), {
        type: "error",
      });
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  return (
    <>
      <div className="min-h-screen px-6 py-20">
        <Loading status={loadingState} fullscreen text={loadingText} />
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
            <ThemeSelector
              selectedTheme={theme}
              onChange={setTheme}
              allowCustomAdd={false}
            />
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
            <>
              <div className=" grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
                {campaigns.map((c) => (
                  <CampaignCard
                    key={c.id}
                    campaign={c}
                    isOwner={c.createdBy === user?.id}
                    onEdit={setEditTarget}
                    onDelete={setDeleteTarget}
                    onPlay={(c) => console.log("play", c.id)}
                  />
                ))}
              </div>
              {pagination.totalPages > 1 && (
                <Pagination className="mt-8">
                  <PaginationContent className="gap-1">
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (page > 1) setPage((prev) => prev - 1);
                        }}
                        className={`
                          rounded-lg border border-[rgba(200,169,110,0.2)] bg-transparent
                          font-cinzel text-[11px] tracking-widest text-[#5a4830]
                          transition-all hover:border-[rgba(200,169,110,0.4)] hover:text-[#c8a96e] hover:bg-[rgba(200,169,110,0.06)]
                          ${page === 1 ? "pointer-events-none" : ""}
                        `}
                      />
                    </PaginationItem>

                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1,
                    ).map((p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          isActive={p === page}
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(p);
                          }}
                          className={`
              rounded-lg border font-cinzel text-[12px] tracking-wider transition-all
              ${
                p === page
                  ? "border-[rgba(200,169,110,0.45)] bg-[rgba(200,169,110,0.12)] text-[#d4b87a] pointer-events-none"
                  : "border-[rgba(200,169,110,0.12)] bg-transparent text-[#5a4830] hover:border-[rgba(200,169,110,0.35)] hover:text-[#c8a96e] hover:bg-[rgba(200,169,110,0.06)]"
              }
            `}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (page < pagination.totalPages)
                            setPage((prev) => prev + 1);
                        }}
                        className={`
                          rounded-lg border border-[rgba(200,169,110,0.2)] bg-transparent
                          font-cinzel text-[11px] tracking-widest text-[#5a4830]
                          transition-all hover:border-[rgba(200,169,110,0.4)] hover:text-[#c8a96e] hover:bg-[rgba(200,169,110,0.06)]
                          ${page === pagination.totalPages ? "pointer-events-none opacity-30" : ""}
                        `}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </main>
      </div>

      {createOpen && (
        <CampaignModal
          onClose={() => setCreateOpen(false)}
          onSave={saveCampaign}
        />
      )}
      {editTarget && (
        <CampaignModal
          campaign={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={saveCampaign}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          campaign={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={deleteCampaign}
        />
      )}
    </>
  );
}
