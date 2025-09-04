"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import lavaKnight from "@/assets/images/lavaKnight.png";
import api from "@/lib/axios";
import { socket } from "@/lib/socket";
import { PlayerCard } from "@/components/ui/playerCard";
import { Button } from "@/components/ui/button";
import Loading from "@/components/ui/loading";
import { LogOut } from "lucide-react";

import { useRouter, usePathname } from "next/navigation";
import { set } from "react-hook-form";
import { is } from "drizzle-orm";

export default function WaitingRoom() {
  interface Player {
    id: number;
    user_id: number;
    room_id: number;
    character_name: string;
    character_class: string;
    level: number;
    is_ready: boolean;
    last_seen_at: string;
  }

  interface Room {
    id: number;
    title: string;
    theme: string;
    password: string;
    max_players: number;
    status: string;
    host_id: number | null;
    created_at: string;
    players: Player[];
  }

  const router = useRouter();

  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [userId, setUserId] = useState<Number | null>(null);
  const [hostPlayer, setHostPlayer] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const params = useParams();
  const id = params.id; // <-- "7"

  const fetchRooms = async () => {
    const currentUserId = Number(localStorage.getItem("user_id"));
    setLoadingState(true);
    setLoadingText("Fetching rooms...");
    try {
      const { data } = await api.get(`/rooms/detail?room_id=${id}`);
      const roomData = data.roomsDetail[0];
      // 👇 Check if user still exists in the room
      const stillInRoom = roomData.players.some(
        (p: Player) => p.user_id === currentUserId
      );

      if (!stillInRoom) {
        console.log("User not in this room anymore, redirecting to lobby.");
        router.replace("/lobby");
        return;
      }
      setRoom(roomData);
      setPlayers(roomData.players);
      console.log("Rooms fetched: ", data.roomsDetail);
      console.log("Players Fetched: ", data.roomsDetail[0].players);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const leaveRoomHandler = async () => {
    const currentUserId = Number(localStorage.getItem("user_id"));
    setLoadingState(true);
    setLoadingText("Leaving room...");
    try {
      const response = await api.delete(
        `/rooms/leave?room_id=${id}&user_id=${currentUserId}`
      );
      console.log("Left room:", response.data);
      socket.emit("leave_room", {
        roomId: id,
        userId: currentUserId,
      });
      router.replace("/lobby");
      // Optionally, you can redirect to another page or update the UI accordingly
    } catch (error) {
      console.error("Error leaving room:", error);
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const startGameHandler = async () => {
    const currentUserId = Number(localStorage.getItem("user_id"));
    const isHost = room?.host_id === currentUserId;
    const currentUserPlayer = players.find(
      (player) => player.user_id === currentUserId
    );
    console.log("Current User Player:", currentUserPlayer);
    console.log("Is Host (from handler):", isHost);
    console.log("Current User ID:", currentUserId);
    console.log("Room ID:", id);
    if (isHost) {
      // Host is starting the game
      setLoadingState(true);
      setLoadingText("Starting game...");
      try {
        socket.emit("start_game", {
          roomId: id,
          userId: currentUserId,
        });
        router.replace(`/game/${id}`);
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
        socket.emit("toggle_ready", {
          roomId: id,
          userId: currentUserId,
          isReady: !currentUserPlayer?.is_ready,
        });
        // Optionally, update the player's ready status in the UI
      } catch (error) {
        console.error("Error toggling ready status:", error);
      } finally {
        setLoadingState(false);
        setLoadingText("");
      }
    }
  };

  useEffect(() => {
    console.log("User ID from localStorage:", userId);
    fetchRooms();
  }, []);

  useEffect(() => {
    console.log("Setting up socket listeners");
    socket.on("room_update", (update) => {
      console.log("Room update received:", update);
      if (update.type === "player_joined" && update.player) {
        setPlayers((prevPlayers) => {
          // Check if the player already exists
          const exists = prevPlayers.some(
            (p) => p.user_id === update.player.user_id
          );

          if (exists) {
            // If player exists, update their info
            return prevPlayers.map((p) =>
              p.user_id === update.player.user_id
                ? { ...p, ...update.player }
                : p
            );
          } else {
            // If player is new, append to the array
            return [...prevPlayers, update.player];
          }
        });
      } else if (update.type === "player_left" && update.user_id) {
        console.log("Player left:", update.user_id);
        console.log("Current players before removal:", players);
        setPlayers((prevPlayers) =>
          prevPlayers.filter((p) => p.user_id !== update.user_id)
        );
        if (update.user_id === userId && update.disconnected) {
          // If the update is about the current user leaving (not disconnecting), redirect to lobby
          router.push("/lobby");
        } else {
          fetchRooms();
        }
      } else if (update.type === "player_toggled_ready" && update.player) {
        setPlayers((prevPlayers) =>
          prevPlayers.map((p) =>
            p.user_id === update.player.user_id
              ? { ...p, is_ready: update.player.is_ready }
              : p
          )
        );
        setIsPlayerReady(update.player.is_ready);
      } else {
        console.warn("Unknown room update type:", update);
      }
    });
    return () => {
      socket.off("room_update");
    };
  }, [socket, router]);

  useEffect(() => {
    const currentUserId = Number(localStorage.getItem("user_id"));

    // No need for setUserId here unless you want the component to re-render
    // when userId changes. We can do the comparison directly.

    console.log("Room Title:", room?.host_id);
    console.log("User Id:", currentUserId);

    const isHost = room?.host_id === currentUserId;
    console.log("Is Host:", isHost);
    setHostPlayer(isHost);

    const readyPlayersCount = players.filter(
      (player) => player.is_ready
    ).length;
    const totalPlayersCount = players.length - 1;

    const isDisabled = readyPlayersCount !== totalPlayersCount && isHost;

    // Now set the button state
    setButtonDisabled(isDisabled);
  }, [room, players]);

  return (
    <>
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center text-white"
        style={{ backgroundImage: "url('/img/bg1.jpg')" }}
      >
        <div className="absolute bottom-4 right-4 cursor-pointer">
          <Button
            className="py-2 px-6 bg-red-600 hover:bg-red-700 rounded-lg font-bold cursor-pointer"
            onClick={leaveRoomHandler}
          >
            <LogOut /> Leave Room
          </Button>
        </div>
        <Loading status={loadingState} fullscreen text={loadingText} />
        <h1 className="text-4xl font-bold mb-6">⚔️ Waiting Room</h1>
        {room ? (
          // Now you can render specific properties of the 'room' object
          <p>Room name: {room.id}</p>
        ) : (
          <p>No room selected.</p>
        )}

        <div className="w-full max-w-3xl bg-opacity-60 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-3 text-center">
            Pemain Bergabung:
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {players.map((player) => (
              <PlayerCard
                key={player.id}
                name={player.character_name}
                status={
                  player.user_id == room?.host_id
                    ? "Host"
                    : player.is_ready
                    ? "Ready"
                    : "Waiting"
                }
                avatarUrl={lavaKnight}
              />
              // <li key={player.id}>{player.character_name}</li>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <Button
            disabled={buttonDisabled}
            className="py-2 px-6 bg-green-600 hover:bg-green-700 rounded-lg font-bold cursor-pointer"
            onClick={startGameHandler}
          >
            {hostPlayer
              ? "Start Game"
              : isPlayerReady
              ? "Unready" // 👈 change this
              : "Ready"}
          </Button>
        </div>
      </div>
    </>
  );
}
