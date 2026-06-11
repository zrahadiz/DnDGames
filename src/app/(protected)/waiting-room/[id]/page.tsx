"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { socket } from "@/lib/socket-client";

import api from "@/lib/axios";

import lavaKnight from "@/assets/images/lavaKnight.png";

import Loading from "@/components/feedback/loading";
import { PlayerCard } from "@/components/ui/playerCard";
import { Button } from "@/components/ui/button";

import { LogOut } from "lucide-react";

import { useRouter } from "next/navigation";
import { RoomDetail } from "@/types/rooms";
import { RoomUpdate } from "@/types/socket";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "@/lib/toast";

export default function WaitingRoom() {
  const { user, fetchUser } = useAuthStore();
  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const router = useRouter();
  const params = useParams();
  const roomId = params.id;

  const currentPlayer: RoomDetail["players"][number] | null =
    room?.players.find((p) => p.userId === user?.id) ?? null;
  const isHost = currentPlayer?.role === "host";
  const isPlayerReady = currentPlayer?.isReady ?? false;
  const players = room?.players ?? [];
  const readyPlayersCount = players.filter(
    (p) => p.role !== "host" && p.isReady,
  ).length;
  const totalPlayersCount = players.filter((p) => p.role !== "host").length;
  const buttonDisabled = isHost && readyPlayersCount !== totalPlayersCount;

  const fetchRooms = async () => {
    setLoadingState(true);
    setLoadingText("Fetching rooms...");
    try {
      const { data } = await api.get(`/rooms/${roomId}`);
      setRoom(data.data);
      console.log("Fetched room data:", data.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const leaveRoomHandler = async () => {
    setLoadingState(true);
    setLoadingText("Leaving room...");
    try {
      const { data } = await api.delete(`/rooms/${roomId}/leave`);
      console.log("Left room:", data);
      if (data.success) {
        console.log("Emitting sync_room_state after leaving room");
        socket.emit("sync_room_state", {
          roomId,
        });
        router.push("/lobby");
      }
    } catch (error) {
      console.error("Error leaving room:", error);
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
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

  const startGameHandler = async () => {
    console.log("Current User Player:", currentPlayer);
    console.log("Is Host (from handler):", isHost);
    console.log("Current User ID:", user?.id);
    console.log("Room ID:", roomId);
    if (isHost) {
      // Host is starting the game
      setLoadingState(true);
      setLoadingText("Starting game...");
      try {
        const { data } = await api.patch(`/rooms/${roomId}/start`);

        if (data.success) {
          console.log("Emitting sync_room_state after leaving room");
          socket.emit("sync_room_state", {
            roomId,
          });
        }
        router.replace(`/rooms/${roomId}`);
      } catch (error) {
        console.error("Error starting game:", error);
      } finally {
        setLoadingState(false);
        setLoadingText("");
      }
    } else {
      // Non-host is toggling to ready state
      console.log("Toggling ready state for player");
      setLoadingState(true);
      setLoadingText("Updating status...");
      try {
        const { data } = await api.patch(`/rooms/${roomId}/toggle-ready`);
        console.log("Toggled ready status:", data);
        if (data.success) {
          console.log("Emitting sync_room_state after leaving room");
          socket.emit("sync_room_state", {
            roomId,
          });
        }
      } catch (error) {
        console.error("Error toggling ready status:", error);
      } finally {
        setLoadingState(false);
        setLoadingText("");
      }
    }
  };

  useEffect(() => {
    const handleRoomUpdate = (update: RoomUpdate) => {
      console.log("Received room update:", update);
      switch (update.type) {
        case "room_state_updated":
          if (update.kick) {
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
          console.log("Room deleted:", update.roomId);
          if (update.roomId === roomId) {
            alert("The room has been deleted. Returning to lobby.");
            router.replace("/lobby");
          }
          break;

        case "game_started":
          router.replace(`/rooms/${roomId}`);
          break;

        default:
          console.warn("Unknown room update:", update);
      }
    };

    socket.on("room_update", handleRoomUpdate);

    return () => {
      socket.off("room_update", handleRoomUpdate);
    };
  }, [roomId, router, user?.id]);

  useEffect(() => {
    if (!roomId) return;

    if (!user) {
      fetchUser();
    }

    fetchRooms();

    socket.emit("join_room", {
      roomId,
    });
  }, [roomId]);

  useEffect(() => {
    socket.onAny((event, ...args) => {
      console.log("Socket event:", event, args);
    });

    return () => {
      socket.offAny();
    };
  }, []);

  return (
    <>
      {/* ── Backgrounds (replaces bg1.jpg) ── */}
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

      <div className="min-h-screen flex flex-col items-center px-4 sm:px-6 py-16 sm:py-20">
        <div className="w-full max-w-4xl space-y-8">
          {/* ── Header ── */}
          <div className="text-center space-y-3">
            <p className="text-[10px] tracking-[0.3em] uppercase italic font-serif text-[#8a6f3e]">
              ✦ The Gathering Hall ✦
            </p>
            <h1
              className="text-3xl sm:text-5xl font-bold font-cinzel tracking-wider text-[#e8d5a3]"
              style={{ textShadow: "0 0 40px rgba(200,169,110,0.25)" }}
            >
              Waiting Room
            </h1>
            {room ? (
              <p className="text-sm font-serif italic text-[#7a6548]">
                <span className="text-[#c8a96e] not-italic font-cinzel tracking-wide">
                  {room.name}
                </span>{" "}
                — gather your party before the journey begins.
              </p>
            ) : (
              <p className="text-sm font-serif italic text-[#5a4830]">
                Summoning room details…
              </p>
            )}

            {/* Ornamental divider */}
            <div className="flex items-center gap-3 max-w-xs mx-auto pt-1">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[rgba(200,169,110,0.3)]" />
              <svg
                viewBox="0 0 48 16"
                width="40"
                height="14"
                aria-hidden="true"
              >
                <polygon
                  points="0,8 8,2 16,8 8,14"
                  fill="none"
                  stroke="rgba(200,169,110,0.45)"
                  strokeWidth="0.75"
                />
                <circle cx="24" cy="8" r="2" fill="rgba(200,169,110,0.55)" />
                <polygon
                  points="32,8 40,2 48,8 40,14"
                  fill="none"
                  stroke="rgba(200,169,110,0.45)"
                  strokeWidth="0.75"
                />
              </svg>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[rgba(200,169,110,0.3)]" />
            </div>
          </div>

          {/* ── Party readiness summary ── */}
          {room && (
            <div className="rounded-2xl border border-[rgba(200,169,110,0.15)] bg-[rgba(26,18,8,0.6)] px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">🎲</span>
                <div>
                  <p className="text-sm font-cinzel tracking-wide text-[#e8d5a3]">
                    {readyPlayersCount + 1} / {totalPlayersCount + 1}{" "}
                    adventurers ready
                  </p>
                  <p className="text-[11px] font-serif italic text-[#5a4830]">
                    {isHost
                      ? readyPlayersCount + 1 === totalPlayersCount + 1 &&
                        totalPlayersCount + 1 > 0
                        ? "Your party awaits your command."
                        : "Waiting for everyone to ready up…"
                      : "The host will begin once all are prepared."}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full sm:w-40 h-2 rounded-full bg-black/30 border border-[rgba(200,169,110,0.1)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width:
                      totalPlayersCount + 1 > 0
                        ? `${((readyPlayersCount + 1) / (totalPlayersCount + 1)) * 100}%`
                        : "0%",
                    background:
                      "linear-gradient(90deg,rgba(200,169,110,0.6),rgba(124,58,237,0.5))",
                  }}
                />
              </div>
            </div>
          )}

          {/* ── Player grid ── */}
          <div className="rounded-2xl border border-[rgba(200,169,110,0.15)] bg-[rgba(26,18,8,0.5)] p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-lg">⚔️</span>
              <h2 className="text-sm font-cinzel tracking-[0.15em] uppercase text-[#8a6f3e]">
                The Party
              </h2>
              <div className="flex-1 h-px bg-[rgba(200,169,110,0.1)]" />
              <span className="text-[11px] font-serif italic text-[#5a4830]">
                {players.length} {players.length === 1 ? "soul" : "souls"}
              </span>
            </div>

            {players.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <span className="text-3xl opacity-40">🏚️</span>
                <p className="text-sm italic font-serif text-[#5a4830]">
                  The hall stands empty…
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {room?.players.map((player) => (
                  <PlayerCard
                    key={player.userId}
                    name={player.character?.name || "Unknown"}
                    status={player.isReady}
                    avatarUrl={lavaKnight}
                    onKick={() => kickPlayerHandler(player.userId)}
                    canKick={isHost && player.role !== "host"}
                    isHost={player.role === "host"}
                    isMe={player.userId === user?.id}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Action bar ── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={leaveRoomHandler}
              className="w-full sm:w-auto rounded-xl border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.05)] font-cinzel text-sm tracking-wider text-[#f87171] hover:border-[rgba(239,68,68,0.45)] hover:bg-[rgba(239,68,68,0.1)] transition-all cursor-pointer gap-2"
            >
              <LogOut className="w-4 h-4" />
              Leave Room
            </Button>

            <Button
              disabled={buttonDisabled}
              onClick={startGameHandler}
              className={`w-full sm:w-auto rounded-xl font-cinzel text-sm tracking-wider transition-all duration-200 cursor-pointer px-8 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${
                !isHost && isPlayerReady
                  ? "border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] text-[#f87171] hover:bg-[rgba(239,68,68,0.15)]"
                  : "border border-[rgba(200,169,110,0.45)] text-[#e8d5a3] hover:-translate-y-0.5"
              }`}
              style={
                !(!isHost && isPlayerReady)
                  ? {
                      background: "linear-gradient(135deg,#3d2e10,#2a1f0a)",
                      boxShadow: "0 0 24px rgba(200,169,110,0.12)",
                    }
                  : undefined
              }
            >
              {isHost
                ? "⚔ Start Game"
                : isPlayerReady
                  ? "Unready"
                  : "✦ I'm Ready"}
            </Button>
          </div>

          {/* Helper text for host when not all ready */}
          {isHost &&
            totalPlayersCount > 0 &&
            readyPlayersCount !== totalPlayersCount && (
              <p className="text-center text-[11px] italic font-serif text-[#5a4830] -mt-2">
                All adventurers must be ready before the journey can begin.
              </p>
            )}
        </div>
      </div>
    </>
  );
}

function canKickFn(isHost: boolean, player: { role: string }) {
  return isHost && player.role !== "host";
}
