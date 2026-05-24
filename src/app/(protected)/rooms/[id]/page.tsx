"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

import api from "@/lib/axios";

import character1 from "@/assets/images/character1.svg";
import character2 from "@/assets/images/character2.png";
import character3 from "@/assets/images/character3.png";

import Loading from "@/components/feedback/loading";
import { CardHero } from "@/components/ui/playerHero";
import { socket } from "@/lib/socket";

export default function Home() {
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

  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
    [],
  );
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [input, setInput] = useState("");

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams();
  const id = params.id; // <-- "7"

  const fetchRooms = async () => {
    const currentUserId = Number(localStorage.getItem("user_id"));
    setLoadingState(true);
    setLoadingText("Fetching rooms...");
    try {
      const { data } = await api.get(`/rooms/detail?room_id=${id}`);
      const roomData = data.roomsDetail[0];

      setRoom(roomData);
      setPlayers(roomData.players);
      socket.emit("refresh_room", {
        roomId: id,
        userId: currentUserId,
      });

      console.log("Rooms fetched: ", data.roomsDetail);
      console.log("Players Fetched: ", data.roomsDetail[0].players);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const fetchMessages = async () => {
    setLoadingState(true);
    setLoadingText("Mengambil Pesan");
    try {
      const { data } = await api.get(`/message?room_id=${id}`);
      const allMessages = data.data;
      console.log(allMessages);

      // Check if the API response data is an array
      if (Array.isArray(allMessages)) {
        // Use .map() to transform each message object
        const formattedMessages = allMessages.map((message) => ({
          sender: message.sender,
          text: message.content,
        }));

        // Set the state with the new, formatted array
        setMessages(formattedMessages);
      } else {
        console.error("API response is not an array:", data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const currentUserId = Number(localStorage.getItem("user_id"));
    // const currentPlayerTurnId = players[turnIndex]?.user_id;

    const playerInfo = players.find((p: Player) => p.user_id === currentUserId);
    console.log(players);

    console.log(playerInfo);

    socket.emit("send_message", {
      roomId: id,
      sender: "user",
      content: input,
      turnIndex,
    });

    setInput("");
  };

  const askAi = async () => {
    setLoadingState(true);
    setLoadingText("Dungeon Master are thinking...");
    const lastMessage = messages.slice(-players.length);
    const aiPrompt =
      "The response for each hero is as follows:\n" +
      lastMessage.map((m) => `${m.sender} = ${m.text}`).join("\n");
    console.log(aiPrompt);
    try {
      const initAI = await api.post("ai", { prompt: aiPrompt });
      const aiResponse = initAI.data.text;
      console.log(aiResponse);

      socket.emit("send_message", {
        roomId: id,
        sender: "ai",
        content: aiResponse,
        turnIndex,
      });
    } catch (error) {
      console.error("Error leaving room:", error);
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }

    setTurnIndex(0); // Reset the turn index to the first player
  };

  useEffect(() => {
    fetchRooms();
    fetchMessages();
  }, []);

  useEffect(() => {
    const currentUserId = Number(localStorage.getItem("user_id"));
    console.log("Setting up socket listeners");
    socket.on("room_update", (update) => {
      console.log("Room update received:", update);
      if (update.type === "send_message") {
        setTurnIndex(update.turnIndex);
        const messageInfo = update.message[0];
        setMessages((prev) => [
          ...prev,
          { sender: messageInfo.sender, text: messageInfo.content },
        ]);
      }
    });
    return () => {
      socket.off("room_update");
    };
  }, [socket]);

  useEffect(() => {
    console.log("ti: ", turnIndex);
    if (players.length > 0 && turnIndex === players.length) {
      console.log(
        "All players have taken their turn! Running end-of-turn logic.",
      );
      askAi();
    }
  }, [turnIndex, players]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Split the players array into two halves
  const half = Math.ceil(players.length / 2);
  const leftPlayers = players.slice(0, half);
  const rightPlayers = players.slice(half);

  return (
    <div className="flex flex-col justify-center py-5 px-10 bg-gray-100 h-screen w-full">
      <Loading status={loadingState} fullscreen text={loadingText} />
      {/* Header */}
      <h1 className="hidden md:block text-3xl font-extrabold text-gray-800 mb-4 text-center shrink-0">
        Dungeon Room - {room?.title}
      </h1>

      {/* Main Layout Grid → flex-1 ensures it fills remaining height */}
      <div className="flex-1 grid grid-cols-12 gap-2 md:gap-4 min-h-0 max-h-full">
        {/* Left Column (Players) */}
        <div className="hidden md:flex col-span-12 md:col-span-3 justify-center">
          <div className="flex flex-col justify-between gap-4 w-full sm:w-2/3 md:w-full">
            {leftPlayers.map((player) => (
              <CardHero
                key={player.id}
                image={character2}
                name={player.character_name}
                role={`${player.character_class} - Level ${player.level}`}
                isTurn={players[turnIndex]?.user_id == player.user_id}
              />
            ))}
          </div>
        </div>

        {/* Middle Column (Chat Area) */}
        <div className="col-span-12 md:col-span-6 flex flex-col min-h-20">
          <div className="flex flex-col bg-white shadow-lg rounded-xl p-4 flex-1 min-h-20">
            {/* Chat Header */}
            <h1 className="text-xl font-bold mb-4 text-gray-800 shrink-0">
              The Arena
            </h1>

            {/* Messages (scrollable) */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto mb-4 space-y-2 min-h-0"
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg ${
                    msg.sender === "ai"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  <b>{msg.sender === "ai" ? "Dungeon Master" : msg.sender}:</b>{" "}
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="flex gap-2 shrink-0">
              <textarea
                className="flex-1 border border-gray-300 rounded-lg p-2 resize-none min-h-[3rem] focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                onClick={sendMessage}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-700 transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (Players) */}
        <div className="hidden md:flex col-span-12 md:col-span-3 justify-center">
          <div className="flex flex-col justify-between gap-4 w-full sm:w-2/3 md:w-full">
            {rightPlayers.map((player) => (
              <CardHero
                key={player.id}
                image={character2}
                name={player.character_name}
                role={`${player.character_class} - Level ${player.level}`}
                isTurn={players[turnIndex]?.user_id == player.user_id}
              />
            ))}
          </div>
        </div>

        {/* Players for Phone */}
        {players.map((player) => (
          <div
            key={player.id}
            className="flex md:hidden col-span-3 justify-center mt-5"
          >
            <CardHero
              image={character3}
              name={player.character_name}
              role={`${player.character_class} - Level ${player.level}`}
              isTurn={players[turnIndex]?.user_id == player.user_id}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
