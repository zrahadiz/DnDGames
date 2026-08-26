"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import Loading from "@/components/feedback/loading";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { socket } from "@/lib/socket-client";
import { RoomWithRelations } from "@/types/rooms";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { CampaignWithRelations } from "@/types/campaigns";
import { CharacterSuggestions } from "@/types/characters";
import CampaignPickerDialog from "@/components/campaigns/CampaignPickerDialog";
import OrnamentalDivider from "@/components/ornaments/ornamentalDivider";
import { Search, UsersRound } from "lucide-react";
import JoinRoomDialog from "@/components/rooms/joinRoomDialog";
import { JoinRoomInput } from "@/types/roomPlayers";

const STATUS_CONFIG = {
  waiting: {
    label: "Waiting",
    dot: "bg-amber-400",
    text: "text-amber-400",
    border: "border-amber-400/20",
    bg: "bg-amber-400/10",
  },
  playing: {
    label: "Playing",
    dot: "bg-emerald-400",
    text: "text-emerald-400",
    border: "border-emerald-400/20",
    bg: "bg-emerald-400/10",
  },
  finished: {
    label: "Finished",
    dot: "bg-[#5a4830]",
    text: "text-[#5a4830]",
    border: "border-[#3a2a14]",
    bg: "bg-black/20",
  },
};

export default function Home() {
  const router = useRouter();
  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const [rooms, setRooms] = useState<RoomWithRelations[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] =
    useState<CampaignWithRelations | null>(null);
  const [campaignId, setCampaignId] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1,
  });

  const fetchRooms = async () => {
    setLoadingState(true);
    setLoadingText("Fetching rooms...");
    console.log("Fetching rooms with params:", {
      campaignId,
    });
    try {
      const { data } = await api.get("/rooms", {
        params: {
          search,
          status,
          campaignId,
          page,
          limit,
        },
      });
      console.log("Rooms fetched: ", data.data);
      setRooms(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast(getErrorMessage(error), {
        type: "error",
      });
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [search, status, campaignId, page, limit]);

  const [suggestions, setSuggestions] = useState<CharacterSuggestions | null>(
    null,
  );

  const [joinRoomDialog, setJoinRoomDialog] = useState(false);
  const [needCode, setNeedCode] = useState(false);
  const [roomCampaignId, setRoomCampaignId] = useState<string>("");
  const [joinRoomForm, setJoinRoomForm] = useState<JoinRoomInput>({
    roomId: "",
    code: "",
    character: {
      name: "",
      race: "",
      characterClass: "",
      backstory: "",
    },
  });

  const openJoinDialog = async (
    roomId: string,
    campaignId: string,
    roomCode: boolean,
  ) => {
    console.log("openJoinDialog called with:", {
      roomId,
      campaignId,
      roomCode,
    });
    setLoadingState(true);
    setLoadingText("Fetching character suggestions...");

    try {
      const { data } = await api.get(`/master-character/${campaignId}`);

      setSuggestions(data.data);

      setJoinRoomForm((prev) => ({
        ...prev,
        roomId,
      }));

      setJoinRoomDialog(true);
      setNeedCode(roomCode);
      setRoomCampaignId(campaignId);
    } catch (error) {
      toast(getErrorMessage(error), {
        type: "error",
      });
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const handleRetrySuggestions = async (id?: string) => {
    setLoadingState(true);
    setLoadingText("Fetching character suggestions...");
    try {
      const { data } = await api.post(`ai/characters/${id}`);
      setSuggestions(data.data);
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

  const joinRoom = async () => {
    setJoinRoomDialog(false);
    setLoadingState(true);
    setLoadingText("Joining room...");
    try {
      const { data } = await api.post("/rooms/join", joinRoomForm);

      if (data.success) {
        socket.emit("join_room", {
          roomId: joinRoomForm.roomId,
        });

        socket.emit("sync_room_state", {
          roomId: joinRoomForm.roomId,
        });

        router.push(`/waiting-room/${joinRoomForm.roomId}`);
      }
    } catch (error) {
      toast(getErrorMessage(error), {
        type: "error",
      });
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  useEffect(() => {
    socket.connect();
    fetchRooms();
    socket.on("connect", () => {
      console.log("connected:", socket.id);
    });

    socket.on("error_message", (msg: string) => {
      console.error("socket error:", msg);
    });
  }, []);

  return (
    <>
      <Loading status={loadingState} fullscreen text={loadingText} />
      <div className="min-h-screen px-4 sm:px-6 py-20">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* ── Page header ── */}
          <div className="text-center space-y-3">
            <p className="text-[10px] tracking-[0.3em] uppercase italic font-serif text-[#8a6f3e]">
              ✦ The Gathering Hall ✦
            </p>
            <h1
              className="text-3xl sm:text-5xl font-bold font-cinzel tracking-wider text-[#e8d5a3]"
              style={{ textShadow: "0 0 40px rgba(200,169,110,0.25)" }}
            >
              Open Rooms
            </h1>
            <p className="text-sm italic font-serif text-[#7a6548] max-w-md mx-auto">
              Find your party. Join the adventure. Or open a room of your own.
            </p>

            {/* Ornamental divider */}
            <OrnamentalDivider />
          </div>

          {/* ── Filters bar ── */}
          <div
            className="rounded-2xl border border-[rgba(200,169,110,0.15)] p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
            style={{ background: "rgba(26,18,8,0.7)" }}
          >
            {/* Search */}
            <InputGroup className="rounded-xl border-[rgba(200,169,110,0.2)] bg-black/30 text-[#e8d5a3] placeholder:text-[#3a2a14] focus-visible:ring-0 focus-visible:border-[rgba(200,169,110,0.45)] font-serif text-sm">
              <InputGroupInput
                placeholder="Search rooms…"
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
            </InputGroup>

            {/* Campaign filter */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setCampaignDialogOpen(true)}
              className="rounded-xl border-[rgba(200,169,110,0.2)] bg-black/20 font-cinzel text-xs tracking-wider text-[#8a6f3e] hover:border-[rgba(200,169,110,0.4)] hover:text-[#c8a96e] hover:bg-transparent sm:w-44 justify-between"
            >
              <span className="truncate">
                {selectedCampaign ? selectedCampaign.title : "All Campaigns"}
              </span>
              {selectedCampaign && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCampaign(null);
                    setCampaignId("");
                  }}
                  className="ml-2 text-[#f87171]/60 hover:text-[#f87171] transition-colors"
                >
                  ×
                </span>
              )}
            </Button>

            {/* Status filter */}
            <Select
              value={status || "all"}
              onValueChange={(value) => {
                setPage(1);
                setStatus(value === "all" ? "" : value);
              }}
            >
              <SelectTrigger className="h-10 w-full rounded-xl border-[rgba(200,169,110,0.2)] bg-[#120c05] font-cinzel text-xs tracking-wide text-[#8a6f3e] focus:ring-0 sm:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="border-[rgba(200,169,110,0.2)] bg-[#120c05] text-[#e8d5a3]">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="playing">Playing</SelectItem>
                <SelectItem value="finished">Finished</SelectItem>
              </SelectContent>
            </Select>

            {/* Per page */}
            <Select
              value={String(limit)}
              onValueChange={(value) => {
                setPage(1);
                setLimit(Number(value));
              }}
            >
              <SelectTrigger className=" h-10 w-full rounded-xl border-[rgba(200,169,110,0.2)] bg-[#120c05] font-cinzel text-xs tracking-wide text-[#8a6f3e] focus:ring-0 sm:w-32">
                <SelectValue />
              </SelectTrigger>

              <SelectContent className="border-[rgba(200,169,110,0.2)] bg-[#120c05] text-[#e8d5a3]">
                <SelectItem value="6">6 / page</SelectItem>
                <SelectItem value="12">12 / page</SelectItem>
                <SelectItem value="24">24 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ── Room grid ── */}
          {rooms?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {rooms.map((room) => {
                const st =
                  STATUS_CONFIG[room.status as keyof typeof STATUS_CONFIG] ??
                  STATUS_CONFIG.waiting;

                return (
                  <div
                    key={room.id}
                    className="group rounded-2xl border border-[rgba(200,169,110,0.12)] bg-gradient-to-b from-[#1a1208] to-[#120d1a] flex flex-col overflow-hidden transition-all duration-300 hover:border-[rgba(200,169,110,0.35)] hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)]"
                  >
                    {/* Colour band by status */}
                    <div
                      className={`h-1 w-full ${
                        room.status === "playing"
                          ? "bg-gradient-to-r from-emerald-500/60 to-teal-400/40"
                          : room.status === "finished"
                            ? "bg-gradient-to-r from-[#3a2a14]/80 to-[#1a1208]"
                            : "bg-gradient-to-r from-[rgba(200,169,110,0.6)] to-[rgba(124,58,237,0.4)]"
                      }`}
                    />

                    <div className="p-5 flex flex-col gap-3 flex-1">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="min-w-0">
                            <h3 className="font-cinzel text-sm font-semibold tracking-wide text-[#e8d5a3] truncate">
                              {room.name}
                            </h3>
                            <p className="text-[11px] font-serif italic text-[#5a4830] truncate">
                              {room.campaign.theme.name}
                            </p>
                          </div>
                        </div>

                        {/* Status badge */}
                        <span
                          className={`shrink-0 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-cinzel tracking-wider ${st.text} ${st.border} ${st.bg}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${st.dot} ${room.status === "playing" ? "animate-pulse" : ""}`}
                          />
                          {st.label}
                        </span>
                      </div>

                      {/* Campaign title */}
                      <div className="rounded-xl border border-[rgba(200,169,110,0.08)] bg-black/20 px-3 py-2">
                        <p className="text-[11px] font-cinzel tracking-wide text-[#8a6f3e] mb-0.5">
                          Campaign
                        </p>
                        <p className="text-[13px] font-serif italic text-[#c8a96e] truncate">
                          {room.campaign.title}
                        </p>
                      </div>

                      {/* Meta row */}
                      <div className="flex items-center justify-between text-xs font-serif">
                        <div className="flex items-center gap-1.5 text-[#7a6548]">
                          <UsersRound className="w-4 h-4" />
                          <span className="">
                            Up to {room.maxPlayers} players
                          </span>
                        </div>
                        <span className="text-[#5a4830] italic truncate max-w-[120px]">
                          by {room.host.name}
                        </span>
                      </div>

                      {/* Spacer */}
                      <div className="flex-1" />

                      {/* Footer divider */}
                      <div className="h-px w-full bg-gradient-to-r from-transparent via-[rgba(200,169,110,0.1)] to-transparent" />

                      {/* Join button */}
                      <Button
                        variant="outline"
                        onClick={() =>
                          openJoinDialog(room.id, room.campaignId, room.hasCode)
                        }
                        disabled={room.status === "finished"}
                        className="w-full rounded-xl border-[rgba(200,169,110,0.25)] bg-[rgba(200,169,110,0.06)] font-cinzel text-xs tracking-wider text-[#d4b87a] hover:border-[rgba(200,169,110,0.5)] hover:bg-[rgba(200,169,110,0.12)] hover:text-[#e8d5a3] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[rgba(200,169,110,0.06)] disabled:hover:border-[rgba(200,169,110,0.25)]"
                      >
                        {room.status === "finished"
                          ? "Concluded"
                          : "⚔ Join Room"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <span className="text-5xl opacity-30">🏰</span>
              <p className="font-cinzel text-lg text-[#5a4830]">
                No rooms found
              </p>
              <p className="text-sm italic font-serif text-[#3a2a14]">
                The hall is empty. Be the first to open a room.
              </p>
              <Button
                variant="outline"
                onClick={() => router.push("/rooms/create")}
                className="mt-2 rounded-xl border-[rgba(200,169,110,0.3)] bg-[rgba(200,169,110,0.06)] font-cinzel text-sm tracking-wider text-[#d4b87a] hover:border-[rgba(200,169,110,0.5)] hover:bg-[rgba(200,169,110,0.12)] cursor-pointer"
              >
                ⚔ Open a Room
              </Button>
            </div>
          )}

          {/* ── Pagination ── */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-xl border-[rgba(200,169,110,0.2)] bg-transparent font-cinzel text-xs tracking-wider text-[#5a4830] hover:border-[rgba(200,169,110,0.4)] hover:text-[#c8a96e] disabled:opacity-30 disabled:pointer-events-none"
              >
                ← Prev
              </Button>

              <div className="flex items-center gap-1">
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
                        key={`e-${i}`}
                        className="w-7 text-center text-xs text-[#3a2a14]"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`h-8 w-8 rounded-lg text-xs font-cinzel transition-all ${
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

              <Button
                variant="outline"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border-[rgba(200,169,110,0.2)] bg-transparent font-cinzel text-xs tracking-wider text-[#5a4830] hover:border-[rgba(200,169,110,0.4)] hover:text-[#c8a96e] disabled:opacity-30 disabled:pointer-events-none"
              >
                Next →
              </Button>
            </div>
          )}
        </div>

        {/* ── Floating create room button ── */}
        <div className="fixed bottom-8 right-8 z-20">
          <Button
            variant="outline"
            onClick={() => router.push("/rooms/create")}
            className="rounded-xl border-[rgba(200,169,110,0.4)] bg-[#1a1208] font-cinzel text-sm tracking-wider text-[#d4b87a] shadow-[0_0_24px_rgba(200,169,110,0.12)] hover:border-[rgba(200,169,110,0.6)] hover:bg-[rgba(200,169,110,0.1)] hover:text-[#e8d5a3] hover:-translate-y-1 transition-all duration-200 cursor-pointer px-5 py-3"
          >
            ⚔ Create Room
          </Button>
        </div>
      </div>

      <JoinRoomDialog
        open={joinRoomDialog}
        onOpenChange={setJoinRoomDialog}
        joinRoomInput={joinRoomForm}
        setJoinRoomInput={setJoinRoomForm}
        onJoin={joinRoom}
        needCode={needCode}
        suggestions={suggestions}
        onRetrySuggestions={() => handleRetrySuggestions(roomCampaignId)}
      />
      <CampaignPickerDialog
        open={campaignDialogOpen}
        selectedCampaignId={selectedCampaign?.id || null}
        onClose={() => setCampaignDialogOpen(false)}
        onSelect={(campaign) => {
          setSelectedCampaign(campaign);
          setCampaignId(campaign.id);
        }}
      />
    </>
  );
}
