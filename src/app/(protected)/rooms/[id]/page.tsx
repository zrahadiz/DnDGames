"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

import { useAuthStore } from "@/stores/auth-store";
import { socket } from "@/lib/socket-client";
import { toast } from "@/lib/toast";
import api from "@/lib/axios";

import { LogOut, Skull } from "lucide-react";

import DiceRollOverlay from "@/components/feedback/diceOverlay";
import Loading from "@/components/feedback/loading";
import {
  MobilePlayerChip,
  PlayerSideCard,
  CombatDialog,
  GameEventCard,
} from "@/components/rooms/playingRoom";

import { Button } from "@/components/ui/button";

import { RoomUpdate } from "@/types/socket";
import { RoomDetail } from "@/types/rooms";
import {
  CreateCombatInput,
  GameEventWithRelations,
  TurnProgress,
} from "@/types/gameEvents";
import ConfirmationModal from "@/components/feedback/confirmModal";

export default function Room() {
  const { user, fetchUser } = useAuthStore();
  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [diceOpen, setDiceOpen] = useState(false);
  const [diceResult, setDiceResult] = useState(0);
  const [gameEvents, setGameEvents] = useState<GameEventWithRelations[]>([]);
  const [turnProgress, setTurnProgress] = useState<TurnProgress | null>(null);
  const [input, setInput] = useState("");
  const [combatDialog, setCombatDialog] = useState(false);
  const [showEndGameModal, setShowEndGameModal] = useState(false);
  const [isEndingGame, setIsEndingGame] = useState(false);

  const [combatForm, setCombatForm] = useState<CreateCombatInput>({
    target: "",
    how: "",
  });

  const [pendingAction, setPendingAction] = useState<
    "combat" | "dice_roll" | "lockpick" | null
  >(null);

  const handleCombatInput = (key: keyof CreateCombatInput, value: string) => {
    setCombatForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const roomId = params.id;
  const router = useRouter();
  const resolvingRef = useRef(false);
  const isHost = room?.hostId === user?.id;
  console.log("roomId:", room, "user:", user, "isHost:", isHost);

  const fetchRooms = async () => {
    setLoadingState(true);
    setLoadingText("Fetching rooms...");
    try {
      const { data } = await api.get(`/rooms/${roomId}`);
      setRoom(data.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const fetchEvents = async () => {
    setLoadingState(true);
    setLoadingText("Mengambil Pesan");
    try {
      const { data } = await api.get(`/rooms/${roomId}/actions`);
      console.log("fetched messages:", data);
      setGameEvents(data.data.events);
      setTurnProgress(data.data.turnProgress);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const submitAction = async () => {
    if (!input.trim()) return;

    await submitGameEvent({
      eventType: "player_action",
      action: input,
    });

    setInput("");
  };

  const submitGameEvent = async (payload: any) => {
    try {
      setIsSubmitting(true);

      const { data } = await api.post(`/rooms/${roomId}/actions`, payload);
      console.log("Submitted action:", data);
      const updatedTurnProgress = data.data.turnProgress;
      setTurnProgress(updatedTurnProgress);

      socket.emit("game_event_created", {
        roomId,
        event: data.data.event,
        turnProgress: data.data.turnProgress,
      });

      if (updatedTurnProgress?.allPlayersSubmitted) {
        resolveTurn();
      }

      return data.data;
    } catch (error) {
      console.error(error);

      toast("Failed to submit action", {
        type: "error",
      });

      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resolveTurn = async () => {
    if (resolvingRef.current) return;
    resolvingRef.current = true;

    socket.emit("generate_ai_response", {
      roomId,
      started: true,
    });

    try {
      const { data } = await api.post(`/rooms/${roomId}/resolve-turn`);
      console.log("Turn resolved:", data);

      socket.emit("game_event_created", {
        roomId,
        event: data.data.aiEvent,
        turnProgress: data.data.turnProgress,
      });

      socket.emit("sync_room_state", {
        roomId,
      });
    } catch (error: any) {
      if (error?.response?.status !== 409) {
        console.error(error);
        socket.emit("generate_ai_response", {
          roomId,
          started: false,
        });
      }
    } finally {
      resolvingRef.current = false;
    }
  };

  const handleEndGame = async () => {
    try {
      setIsEndingGame(true);
      const { data } = await api.post(`/rooms/${roomId}/end-game`, {
        reason: "abandoned",
        title: "Adventure Ended",
        summary: "The host has ended the adventure.",
      });

      socket.emit("game_event_created", {
        roomId,
        event: data.data.gameEndEvent,
      });

      socket.emit("sync_room_state", {
        roomId,
      });
      setShowEndGameModal(false);
    } catch (error) {
      console.error("Failed to end game:", error);
    } finally {
      setIsEndingGame(false);
    }
  };

  const handleLeaveGame = () => {
    if (!roomId) return;

    socket.emit("leave_room", { roomId }, (response: { success: boolean }) => {
      console.log("leave_room response:", response);
      if (response.success) {
        router.push("/lobby");
      }
    });
  };

  const kickPlayerHandler = async (targetUserId: string) => {
    setLoadingState(true);
    setLoadingText("Kicking player...");
    try {
      const { data } = await api.post(`/rooms/${roomId}/kick`, {
        userTargetId: targetUserId,
      });
      console.log("Kick player response:", data);
      if (data.success) {
        console.log("Emitting sync_room_state after kicking player");
        socket.emit("sync_room_state", {
          roomId,
          kick: true,
        });
      }
    } catch (error) {
      console.error("Error kicking player:", error);
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  useEffect(() => {
    const handleRoomUpdate = (update: RoomUpdate) => {
      console.log("Received room update:", update);
      switch (update.type) {
        case "room_state_updated":
          if (update.kick) {
            console.log("user: ", user);
            if (!user?.id) {
              return;
            }

            const me = update.room.players.find(
              (player) => player.userId === user.id,
            );

            if (!me) {
              toast("You were kicked from the room", {
                type: "error",
              });
              router.push("/lobby");
              return;
            }
          }

          setRoom(update.room);
          break;

        case "room_deleted":
          window.location.href = "/rooms";
          break;
      }
    };

    socket.on("room_update", handleRoomUpdate);

    return () => {
      socket.off("room_update", handleRoomUpdate);
    };
  }, [roomId, router, user?.id]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [gameEvents]);

  useEffect(() => {
    if (!roomId) return;

    if (!user) {
      fetchUser();
    }

    fetchRooms();
    fetchEvents();

    console.log("Joining room", roomId);
    socket.emit("join_room", {
      roomId,
    });
  }, [roomId]);

  useEffect(() => {
    const handleAiGeneration = ({ started }: { started: boolean }) => {
      setIsAiThinking(started);
      console.log("ai is thinking: ", isAiThinking);
    };

    socket.on("generate_ai_response", handleAiGeneration);

    return () => {
      socket.off("generate_ai_response", handleAiGeneration);
    };
  }, []);

  useEffect(() => {
    const handleGameEvent = ({
      event,
      turnProgress,
    }: {
      event: GameEventWithRelations;
      turnProgress?: TurnProgress;
    }) => {
      console.log("received game event", event);
      if (turnProgress) {
        setTurnProgress(turnProgress);
      }

      if (
        event.eventType === "ai_narration" ||
        event.eventType === "game_end"
      ) {
        setIsAiThinking(false);
      }

      setGameEvents((prev) => {
        const exists = prev.some((e) => e.id === event.id);

        if (exists) return prev;

        return [...prev, event];
      });
    };

    socket.on("game_event_created", handleGameEvent);

    return () => {
      socket.off("game_event_created", handleGameEvent);
    };
  }, []);

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0806]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-[rgba(200,169,110,0.2)] border-t-[rgba(200,169,110,0.7)] animate-spin" />
          <p className="text-sm italic font-serif text-[#5a4830]">
            Entering the dungeon…
          </p>
        </div>
      </div>
    );
  }

  const half = Math.ceil(room.players.length / 2);
  const leftPlayers = room.players.slice(0, half);
  const rightPlayers = room.players.slice(half);

  return (
    <>
      {/* ── Backgrounds ── */}
      <div className="fixed inset-0 bg-[#0a0806] -z-10" />
      <div
        className="fixed inset-0 opacity-30 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%,#3d1f05 0%,transparent 70%),radial-gradient(ellipse 60% 40% at 20% 100%,#1a0e2e 0%,transparent 60%),radial-gradient(ellipse 50% 50% at 80% 100%,#0d1f0d 0%,transparent 60%)",
        }}
      />
      <div
        className="fixed inset-0 opacity-[0.035] -z-10"
        style={{
          backgroundImage:
            "linear-gradient(#c8a96e 1px,transparent 1px),linear-gradient(90deg,#c8a96e 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <Loading status={loadingState} fullscreen text={loadingText} />

      <div className="h-screen flex flex-col overflow-hidden px-3 sm:px-4 py-20 gap-3">
        {/* ── Top bar ── */}
        <div className="shrink-0 flex items-center justify-between gap-3">
          {/* Turn progress badge */}
          {turnProgress && (
            <div className="shrink-0 flex items-center gap-2 rounded-xl border border-[rgba(200,169,110,0.2)] bg-[rgba(200,169,110,0.06)] px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] font-cinzel tracking-wide text-[#c8a96e]">
                Turn {turnProgress.currentTurn}
              </span>
              <span className="text-[#3a2a14] text-[11px]">·</span>
              <span className="text-[11px] font-serif text-[#8a6f3e]">
                {turnProgress.submittedCount}/{turnProgress.totalPlayers} acted
              </span>
            </div>
          )}
        </div>

        {/* ── Main 3-column layout ── */}
        <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
          {/* ── LEFT: player cards ── */}
          <div className="hidden lg:flex col-span-3 flex-col gap-2.5 overflow-y-auto no-scrollbar">
            {leftPlayers.map((player) => (
              <PlayerSideCard
                key={player.id}
                player={player}
                onKick={() => kickPlayerHandler(player.userId)}
                isHost={isHost}
              />
            ))}
          </div>

          {/* ── CENTER: adventure feed + input ── */}
          <div
            className="col-span-12 lg:col-span-6 flex flex-col min-h-0 rounded-2xl border border-[rgba(200,169,110,0.2)] overflow-hidden"
            style={{
              background: "linear-gradient(160deg,#1a1208,#0f0c06,#120d1a)",
            }}
          >
            {/* Gold top bar */}
            <div
              className="h-px w-full shrink-0"
              style={{
                background:
                  "linear-gradient(90deg,transparent,rgba(200,169,110,0.8),transparent)",
              }}
            />

            {/* Feed header */}
            <div
              className="px-4 py-3 shrink-0 flex items-center justify-between"
              style={{ borderBottom: "1px solid rgba(200,169,110,0.1)" }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-lg hidden sm:block">⚔️</span>
                <div className="min-w-0">
                  <h1 className="font-cinzel text-base sm:text-lg font-bold tracking-wider text-[#e8d5a3] truncate">
                    {room.name}
                  </h1>
                  <p className="text-[11px] font-serif italic text-[#5a4830] hidden sm:block">
                    {room.campaign?.title}
                  </p>
                </div>
              </div>
              {turnProgress && (
                <span className="text-[11px] font-serif italic text-[#5a4830]">
                  Waiting for {turnProgress.remainingCount} player
                  {turnProgress.remainingCount !== 1 ? "s" : ""}…
                </span>
              )}
            </div>

            {/* ── Event feed ── */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3 no-scrollbar"
            >
              {gameEvents.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 h-full text-center py-12">
                  <span className="text-4xl opacity-20">📜</span>
                  <p className="text-sm italic font-serif text-[#5a4830]">
                    The story has yet to unfold…
                  </p>
                  <p className="text-[11px] text-[#3a2a14] font-serif">
                    Describe your first action below to begin.
                  </p>
                </div>
              )}

              {gameEvents.map((msg) => (
                <GameEventCard key={msg.id} msg={msg} />
              ))}

              {isAiThinking && (
                <div className="rounded-xl border border-[rgba(167,139,250,0.2)] bg-[rgba(124,58,237,0.07)] p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-[12px] font-cinzel tracking-wide text-[#c4b5fd]">
                      <span className="text-base">🎲</span>
                      Dungeon Master
                    </span>
                    <span className="text-[10px] font-serif italic text-[#3a2a14] animate-pulse">
                      weaving the tale…
                    </span>
                  </div>

                  {/* Animated text lines */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {/* Typing dots */}
                      <div className="flex items-center gap-1">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-[#c4b5fd]/60"
                            style={{
                              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-[11px] font-serif italic text-[#7a6548]">
                        The ancient mind stirs…
                      </p>
                    </div>

                    {/* Shimmer skeleton lines */}
                    {[100, 85, 92, 60].map((w, i) => (
                      <div
                        key={i}
                        className="h-3 rounded-full overflow-hidden"
                        style={{ width: `${w}%` }}
                      >
                        <div
                          className="h-full w-full rounded-full"
                          style={{
                            background:
                              "linear-gradient(90deg,rgba(167,139,250,0.06) 0%,rgba(167,139,250,0.18) 40%,rgba(167,139,250,0.06) 100%)",
                            backgroundSize: "200% 100%",
                            animation: `shimmer 1.8s ease-in-out ${i * 0.15}s infinite`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Input area ── */}
            <div
              className="shrink-0 px-4 py-3 space-y-2.5"
              style={{ borderTop: "1px solid rgba(200,169,110,0.1)" }}
            >
              {room.status === "finished" ? (
                /* ── Game finished banner ── */
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  {/* Title */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-cinzel tracking-[0.3em] uppercase text-[#8a6f3e]">
                      ✦ Adventure Complete ✦
                    </p>
                    <p className="text-sm font-serif italic text-[#7a6548]">
                      This adventure has concluded. No further actions can be
                      submitted.
                    </p>
                  </div>

                  {/* Ornamental divider */}
                  <div className="flex items-center gap-3 w-full max-w-xs">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[rgba(200,169,110,0.2)]" />
                    <span className="text-[#5a4830] text-xs">⚔</span>
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[rgba(200,169,110,0.2)]" />
                  </div>

                  {/* Actions */}
                  {/* <div className="flex flex-wrap items-center justify-center gap-2.5">
                    <button
                      type="button"
                      // onClick={onViewSummary}
                      className="flex items-center gap-2 rounded-xl border border-[rgba(200,169,110,0.35)] bg-[rgba(200,169,110,0.08)] px-4 py-2 text-[12px] font-cinzel tracking-wide text-[#d4b87a] transition-all hover:border-[rgba(200,169,110,0.55)] hover:bg-[rgba(200,169,110,0.14)] hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                    >
                      <span>📜</span>
                      View Adventure Summary
                    </button>
                    <button
                      type="button"
                      onClick={handleLeaveGame}
                      className="flex items-center gap-2 rounded-xl border border-[rgba(239,68,68,0.25)] bg-[rgba(153,27,27,0.08)] px-4 py-2 text-[12px] font-cinzel tracking-wide text-[#f87171] transition-all hover:border-[rgba(239,68,68,0.45)] hover:bg-[rgba(153,27,27,0.14)] hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                    >
                      <span>🚪</span>
                      Leave Room
                    </button>
                  </div> */}
                </div>
              ) : (
                /* ── Normal input ── */
                <>
                  {/* Action type buttons */}
                  <div className="flex justify-between items-center flex-wrap">
                    <div className="flex space-x-2 items-center">
                      <span className="text-[10px] font-cinzel tracking-[0.15em] uppercase text-[#3a2a14]">
                        Action Type
                      </span>
                      {/* Speak button */}
                      <button
                        type="button"
                        className="rounded-xl border px-2.5 py-1 text-[11px] font-cinzel tracking-wide transition-all duration-150 cursor-pointer active:scale-95 border-[rgba(200,169,110,0.45)] bg-[rgba(200,169,110,0.12)] text-[#d4b87a]"
                      >
                        🗣 Speak
                      </button>
                      {/* Combat button */}
                      <button
                        type="button"
                        onClick={() => setCombatDialog(true)}
                        disabled={isAiThinking}
                        className=" flex items-center gap-1.5 rounded-xl px-2.5 py-1 border border-[rgba(167,139,250,0.25)] bg-[rgba(124,58,237,0.07)] text-[11px] font-cinzel tracking-wide text-[#c4b5fd] transition-all hover:border-[rgba(167,139,250,0.45)] hover:bg-[rgba(124,58,237,0.12)] active:scale-95 cursor-pointer"
                      >
                        <span className="text-base leading-none">⚔</span>
                        Combat
                      </button>
                    </div>

                    <div className="flex space-x-3">
                      {/* Roll dice button */}
                      {/* <button
                        type="button"
                        onClick={() => {
                          // setPendingAction("dice_roll");
                          setDiceOpen(true);
                        }}
                        disabled={isAiThinking}
                        className="ml-auto flex items-center gap-1.5 rounded-xl border border-[rgba(167,139,250,0.25)] bg-[rgba(124,58,237,0.07)] px-3 py-1.5 text-[11px] font-cinzel tracking-wide text-[#c4b5fd] transition-all hover:border-[rgba(167,139,250,0.45)] hover:bg-[rgba(124,58,237,0.12)] active:scale-95 cursor-pointer"
                      >
                        <span className="text-base leading-none">🎲</span>
                        Roll Dice
                      </button> */}
                      {isHost && (
                        <button
                          type="button"
                          onClick={() => setShowEndGameModal(true)}
                          disabled={isAiThinking}
                          className="ml-auto flex items-center gap-1.5 rounded-xl border border-[rgba(250,139,139,0.25)] bg-[rgba(237,58,58,0.07)] px-3 py-1.5 text-[11px] font-cinzel tracking-wide text-[#fdb5b5] transition-all hover:border-[rgba(250,139,139,0.45)] hover:bg-[rgba(237,58,58,0.12)] active:scale-95 cursor-pointer"
                        >
                          <Skull className="h-4 w-4" />
                          End Adventure
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Textarea + submit */}
                  <div className="flex gap-2 items-end">
                    <textarea
                      className="flex-1 rounded-xl border border-[rgba(200,169,110,0.2)] bg-black/30 px-3 py-2.5 text-sm font-serif text-[#e8d5a3] placeholder:text-[#3a2a14] resize-none outline-none focus:border-[rgba(200,169,110,0.45)] transition-colors"
                      rows={3}
                      value={input}
                      disabled={isSubmitting || isAiThinking}
                      placeholder="Describe your action…"
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                          submitAction();
                      }}
                    />
                    <button
                      onClick={submitAction}
                      disabled={isSubmitting || !input.trim() || isAiThinking}
                      className="shrink-0 rounded-xl border border-[rgba(200,169,110,0.35)] px-4 py-2.5 text-[13px] font-cinzel tracking-wide text-[#e8d5a3] transition-all hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
                      style={{
                        background: "linear-gradient(135deg,#3d2e10,#2a1f0a)",
                        boxShadow: "0 0 16px rgba(200,169,110,0.1)",
                      }}
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 rounded-full border-2 border-[rgba(200,169,110,0.3)] border-t-[#c8a96e] animate-spin" />
                      ) : (
                        "Act"
                      )}
                    </button>
                  </div>

                  <p className="text-[10px] font-serif italic text-[#3a2a14]">
                    Ctrl + Enter to submit
                  </p>
                </>
              )}
            </div>

            {/* Gold bottom bar */}
            <div
              className="h-px w-full shrink-0"
              style={{
                background:
                  "linear-gradient(90deg,transparent,rgba(200,169,110,0.8),transparent)",
              }}
            />
          </div>

          {/* ── RIGHT: player cards ── */}
          <div className="hidden lg:flex col-span-3 flex-col gap-2.5 overflow-y-auto no-scrollbar">
            {rightPlayers.map((player) => (
              <PlayerSideCard
                key={player.id}
                player={player}
                onKick={() => kickPlayerHandler(player.userId)}
                isHost={isHost}
              />
            ))}
          </div>
        </div>

        {/* ── Mobile player strip (shown below md) ── */}
        <div className="lg:hidden shrink-0 flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {room.players.map((player) => (
            <MobilePlayerChip
              key={player.id}
              player={player}
              onKick={() => kickPlayerHandler(player.userId)}
              isHost={isHost}
            />
          ))}
        </div>

        <div className="fixed bottom-8 right-8 z-20">
          <Button
            variant="outline"
            onClick={handleLeaveGame}
            className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/40 px-5 py-3 font-cinzel text-sm tracking-wider text-red-200 shadow-lg backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-red-500/60 hover:bg-red-900/60 hover:text-white hover:ring-2 hover:ring-red-500/20 active:scale-[0.98] cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Leave Game</span>
          </Button>
        </div>
      </div>

      {showEndGameModal && (
        <ConfirmationModal
          title="End Adventure?"
          description={
            <>
              Are you sure you want to end this adventure? Abandon this quest?
              Players will no longer be able to submit actions.
            </>
          }
          cancelLabel="Continue Adventure"
          confirmLabel="End Adventure"
          variant="danger"
          onClose={() => setShowEndGameModal(false)}
          onConfirm={handleEndGame}
          isLoading={isEndingGame}
        />
      )}

      <CombatDialog
        open={combatDialog}
        onOpenChange={setCombatDialog}
        combatInput={combatForm}
        handleCombatInput={handleCombatInput}
        onCombat={() => {
          setCombatDialog(false);
          setPendingAction("combat");
          setDiceOpen(true);
        }}
      />

      <DiceRollOverlay
        open={diceOpen}
        onClose={() => setDiceOpen(false)}
        onResult={async (result, isCrit, isFail) => {
          if (!pendingAction) return;
          setDiceResult(result);
          toast(
            `🎲 ${isCrit ? "CRIT! " : isFail ? "FAIL! " : ""}Rolled ${result}`,
            {
              type: isCrit ? "success" : isFail ? "error" : "info",
            },
          );

          switch (pendingAction) {
            case "combat":
              await submitGameEvent({
                eventType: "combat",
                target: combatForm.target,
                how: combatForm.how,
                diceRoll: result,
              });
              break;

            case "dice_roll":
              await submitGameEvent({
                eventType: "dice_roll",
                event: "test",
              });
              break;
          }

          setPendingAction(null);
          setDiceOpen(false);
        }}
      />
    </>
  );
}
