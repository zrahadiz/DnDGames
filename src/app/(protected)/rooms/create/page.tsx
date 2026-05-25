"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import Loading from "@/components/feedback/loading";

import { CreateRoomInput } from "@/server/validators/rooms";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { CampaignForm, CampaignWithRelations } from "@/types/campaigns";
import CampaignModal from "@/components/campaigns/campaignModal";
import CampaignPickerDialog from "@/components/campaigns/CampaignPickerDialog";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

export default function CreateRoom() {
  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const router = useRouter();

  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] =
    useState<CampaignWithRelations | null>(null);

  const handleCampaignSelect = (campaign: CampaignWithRelations) => {
    setSelectedCampaign(campaign);
    setField("campaignId", campaign.id);
  };

  const [createCampaignOpen, setCreateCampaignOpen] = useState(false);
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
    setLoadingText("Creating Campaign...");
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
      setCreateCampaignOpen(false);
      handleCampaignSelect(data.data);
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

  const [roomForm, setRoomForm] = useState<CreateRoomInput>({
    campaignId: "",
    name: "",
    roomCode: "",
    maxPlayers: 4,
  });

  const setField = <K extends keyof CreateRoomInput>(
    key: K,
    value: CreateRoomInput[K],
  ) => {
    setRoomForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingState(true);
    setLoadingText("Creating Room...");
    try {
      const payload = {
        ...roomForm,
      };
      const { data } = await api.post("/rooms", payload);
      console.log("Room created:", data);
      toast("Room Created successfully", {
        type: "success",
        position: "top-center",
        duration: 5000,
      });
      router.push(`/waiting-room/${data.data.room.id}`);
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
      <Loading status={loadingState} fullscreen text={loadingText} />
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-3xl">
          {/* Page heading */}
          <div className="text-center mb-8">
            <p
              className="text-[10px] tracking-[0.3em] uppercase italic font-serif mb-2"
              style={{ color: "#8a6f3e" }}
            >
              ✦ Prepare for Battle ✦
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold font-cinzel tracking-wider text-[#e8d5a3]">
              Open a New Room
            </h1>
            <p className="mt-2 text-sm italic font-serif text-[#7a6548]">
              Gather your party. Define your terms. Let the adventure begin.
            </p>
          </div>

          <form onSubmit={handleCreateRoom}>
            <div
              className="rounded-2xl border border-[rgba(200,169,110,0.25)] overflow-hidden"
              style={{
                background: "linear-gradient(160deg,#1a1208,#0f0c06,#120d1a)",
              }}
            >
              {/* Gold top bar */}
              <div
                className="h-px w-full"
                style={{
                  background:
                    "linear-gradient(90deg,transparent,rgba(200,169,110,0.8),transparent)",
                }}
              />

              <div className="p-6 sm:p-8 flex flex-col gap-6">
                {/* ── Campaign selection ── */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-cinzel tracking-[0.08em] text-[#8a6f3e]">
                    Choose Campaign
                  </label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-start">
                    {/* Select existing — shows selected campaign preview if one is picked */}
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCampaignDialogOpen(true)}
                        className="w-full h-14 rounded-xl border-[rgba(200,169,110,0.3)] bg-[rgba(200,169,110,0.06)] font-cinzel text-sm tracking-wider text-[#d4b87a] hover:border-[rgba(200,169,110,0.55)] hover:bg-[rgba(200,169,110,0.12)] hover:text-[#e8d5a3] transition-all duration-200 cursor-pointer"
                      >
                        {selectedCampaign
                          ? "⚔ Change Campaign"
                          : "⚔ Select Campaign"}
                      </Button>
                    </div>

                    {/* OR divider */}
                    <div className="flex items-center justify-center gap-3 sm:pt-4">
                      <div className="h-px w-8 bg-[rgba(200,169,110,0.2)] sm:hidden" />
                      <div className="hidden sm:block w-px h-8 bg-[rgba(200,169,110,0.2)]" />
                      <span className="font-serif text-xs italic tracking-[0.2em] text-[#5a4830]">
                        or
                      </span>
                      <div className="h-px w-8 bg-[rgba(200,169,110,0.2)] sm:hidden" />
                      <div className="hidden sm:block w-px h-8 bg-[rgba(200,169,110,0.2)]" />
                    </div>

                    {/* Forge new */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreateCampaignOpen(true)}
                      className="h-14 rounded-xl border-[rgba(167,139,250,0.25)] bg-[rgba(124,58,237,0.06)] font-cinzel text-sm tracking-wider text-[#c4b5fd] hover:border-[rgba(167,139,250,0.45)] hover:bg-[rgba(124,58,237,0.12)] hover:text-[#e8d5a3] transition-all duration-200 cursor-pointer"
                    >
                      ✦ Forge New Campaign
                    </Button>
                  </div>
                  {/* Selected campaign preview card */}
                  {selectedCampaign && (
                    <div className="flex items-center gap-3 rounded-xl border border-[rgba(200,169,110,0.25)] bg-[rgba(200,169,110,0.05)] px-3 py-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-cinzel tracking-wide text-[#e8d5a3] truncate">
                          {selectedCampaign.title}
                        </p>
                        {/* <p className="text-[11px] font-serif italic text-[#5a4830] truncate">
                          {selectedCampaign.theme?.name} · by{" "}
                          {selectedCampaign.creator?.name}
                        </p> */}
                      </div>
                      {/* Clear selection */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCampaign(null);
                          setField("campaignId", "");
                        }}
                        className="shrink-0 p-1 rounded-md text-[#5a4830] hover:text-[#f87171] transition-colors"
                        aria-label="Clear selection"
                      >
                        <svg
                          viewBox="0 0 14 14"
                          width="12"
                          height="12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        >
                          <path d="M2 2l10 10M12 2L2 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-[rgba(200,169,110,0.1)]" />
                  <svg
                    viewBox="0 0 48 16"
                    width="40"
                    height="14"
                    aria-hidden="true"
                  >
                    <polygon
                      points="0,8 8,2 16,8 8,14"
                      fill="none"
                      stroke="rgba(200,169,110,0.35)"
                      strokeWidth="0.75"
                    />
                    <circle
                      cx="24"
                      cy="8"
                      r="2"
                      fill="rgba(200,169,110,0.45)"
                    />
                    <polygon
                      points="32,8 40,2 48,8 40,14"
                      fill="none"
                      stroke="rgba(200,169,110,0.35)"
                      strokeWidth="0.75"
                    />
                  </svg>
                  <div className="flex-1 h-px bg-[rgba(200,169,110,0.1)]" />
                </div>

                {/* ── Room details ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Room title — full width */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label
                      htmlFor="name"
                      className="block text-[11px] font-cinzel tracking-[0.08em] text-[#8a6f3e]"
                    >
                      Room Title
                    </label>
                    <Input
                      id="name"
                      value={roomForm.name}
                      onChange={(e) => setField("name", e.target.value)}
                      placeholder="The Lost Mines of Phandelver…"
                      required
                      className="rounded-xl border-[rgba(200,169,110,0.2)] bg-black/30 text-[#e8d5a3] placeholder:text-[#3a2a14] focus-visible:ring-0 focus-visible:border-[rgba(200,169,110,0.45)] font-serif"
                    />
                  </div>

                  {/* Max players */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="maxPlayers"
                      className="block text-[11px] font-cinzel tracking-[0.08em] text-[#8a6f3e]"
                    >
                      Max Players
                    </label>
                    <Input
                      id="maxPlayers"
                      type="number"
                      min={1}
                      max={10}
                      value={roomForm.maxPlayers}
                      onChange={(e) =>
                        setField("maxPlayers", Number(e.target.value))
                      }
                      className="rounded-xl border-[rgba(200,169,110,0.2)] bg-black/30 text-[#e8d5a3] placeholder:text-[#3a2a14] focus-visible:ring-0 focus-visible:border-[rgba(200,169,110,0.45)] font-cinzel tracking-wider"
                    />
                  </div>

                  {/* Room password */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="roomCode"
                      className="block text-[11px] font-cinzel tracking-[0.08em] text-[#8a6f3e]"
                    >
                      Room Password
                      <span className="ml-1.5 text-[10px] normal-case text-[#3a2a14] font-serif italic tracking-normal">
                        optional
                      </span>
                    </label>
                    <Input
                      id="roomCode"
                      type="password"
                      value={roomForm.roomCode ?? ""}
                      onChange={(e) => setField("roomCode", e.target.value)}
                      placeholder="Secret passphrase…"
                      className="rounded-xl border-[rgba(200,169,110,0.2)] bg-black/30 text-[#e8d5a3] placeholder:text-[#3a2a14] focus-visible:ring-0 focus-visible:border-[rgba(200,169,110,0.45)] font-serif"
                    />
                    <p className="text-[11px] italic font-serif text-[#3a2a14]">
                      Share this with your party to grant entry.
                    </p>
                  </div>
                </div>

                {/* ── Private room toggle ── */}
                {/* <div className="flex items-start gap-4 rounded-xl border border-[rgba(200,169,110,0.1)] bg-black/20 p-4 transition-colors hover:border-[rgba(200,169,110,0.2)]">
                  <Checkbox
                    id="visibility"
                    checked={roomForm.visibility === "private"}
                    onCheckedChange={(checked) =>
                      setField("visibility", checked ? "private" : "public")
                    }
                    className="mt-0.5 border-[rgba(200,169,110,0.35)] data-[state=checked]:bg-[rgba(200,169,110,0.3)] data-[state=checked]:border-[rgba(200,169,110,0.6)]"
                  />
                  <div className="space-y-0.5">
                    <label
                      htmlFor="visibility"
                      className="block text-sm font-cinzel tracking-wide text-[#c8a96e] cursor-pointer"
                    >
                      Private Room
                    </label>
                    <p className="text-xs italic font-serif text-[#5a4830]">
                      Only adventurers with the password may enter this chamber.
                    </p>
                  </div>
                </div> */}

                {/* Gold mid bar */}
                <div
                  className="h-px w-full"
                  style={{
                    background:
                      "linear-gradient(90deg,transparent,rgba(200,169,110,0.25),transparent)",
                  }}
                />

                {/* ── Actions ── */}
                <div className="flex flex-col-reverse sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/lobby")}
                    className="flex-1 rounded-xl border-[rgba(200,169,110,0.15)] bg-transparent font-cinzel text-sm tracking-wider text-[#5a4830] hover:border-[rgba(200,169,110,0.3)] hover:text-[#8a6f3e] hover:bg-transparent transition-all cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 rounded-xl border border-[rgba(200,169,110,0.45)] bg-[rgba(200,169,110,0.12)] font-cinzel text-sm tracking-wider text-[#e8d5a3] hover:bg-[rgba(200,169,110,0.2)] hover:border-[rgba(200,169,110,0.6)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                  >
                    ⚔ Open the Gates
                  </Button>
                </div>
              </div>

              {/* Gold bottom bar */}
              <div
                className="h-px w-full"
                style={{
                  background:
                    "linear-gradient(90deg,transparent,rgba(200,169,110,0.8),transparent)",
                }}
              />
            </div>
          </form>
        </div>
      </div>

      {createCampaignOpen && (
        <CampaignModal
          onClose={() => setCreateCampaignOpen(false)}
          onSave={saveCampaign}
        />
      )}
      <CampaignPickerDialog
        open={campaignDialogOpen}
        selectedCampaignId={selectedCampaign?.id || null}
        onClose={() => setCampaignDialogOpen(false)}
        onSelect={handleCampaignSelect}
      />
    </>
  );
}
