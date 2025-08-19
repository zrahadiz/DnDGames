"use client";
import { useState } from "react";
import Image from "next/image";

import character1 from "@/assets/images/character1.svg";
import character2 from "@/assets/images/character2.png";
import character3 from "@/assets/images/character3.png";

import { CardHero } from "@/components/ui/playerHero";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    {
      role: "ai",
      text: "Welcome, adventurers! You find yourselves in a dark tavern. A hooded figure approaches...",
    },
  ]);
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add player message
    setMessages((prev) => [...prev, { role: "player", text: input }]);

    // Call AI API (for now: fake AI response)
    const res = await fetch("/api/ai", {
      method: "POST",
      body: JSON.stringify({ prompt: input }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    console.log("AI response:", data.text);
    setAnswer(data.text);

    setMessages((prev) => [...prev, { role: "ai", text: data.text }]);
    setInput("");
  };

  const askAi = async (prompt: string) => {
    if (!input.trim()) return;

    // Add player message
    setMessages((prev) => [...prev, { role: "player", text: input }]);

    // Call AI API (for now: fake AI response)
    const res = await fetch("/api/ai", {
      method: "POST",
      body: JSON.stringify({ prompt: input }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    console.log("AI response:", data.text);
    setAnswer(data.text);

    setMessages((prev) => [...prev, { role: "ai", text: data.text }]);
    setInput("");
  };

  return (
    <div className="h-screen px-4 py-10 bg-gray-100  flex flex-col">
      {/* Head Title*/}
      <h1 className="text-2xl font-bold text-center mb-4">
        🧙 DnD Online Room - (title)
      </h1>
      <div className=" grid grid-flow-col grid-rows-12 grid-cols-12 flex-1">
        <div className="row-span-12 col-span-3 justify-center flex">
          <div className="flex flex-col justify-between gap-4 w-2/3">
            <CardHero
              image={character3}
              name="Player 1"
              role="Knight - Level 5"
            />
            <CardHero
              image={character2}
              name="Player 1"
              role="Mage - Level 5"
            />
          </div>
        </div>
        <div className="row-span-12 col-span-6 justify-between flex flex-col">
          {/* Chat Area */}
          <div className="w-full h-full bg-white shadow-lg rounded-xl p-4 flex flex-col">
            <h1 className="text-xl font-bold mb-4">The Arena</h1>

            <div className="flex-1 overflow-y-auto mb-4 space-y-2">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg ${
                    msg.role === "ai"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  <b>{msg.role === "ai" ? "Dungeon Master" : "You"}:</b>{" "}
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="flex gap-2">
              <textarea
                className="flex-1 border rounded-lg p-2 w-5/6 resize-y min-h-[3rem]"
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button
                onClick={sendMessage}
                className="bg-purple-600 text-white px-4 py-2 w-1/6 h-full rounded-lg cursor-pointer hover:bg-purple-700"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
        <div className="row-span-12 col-span-3 justify-center flex">
          <div className="flex flex-col justify-between gap-4 w-2/3">
            <CardHero
              image={character3}
              name="Player 1"
              role="Knight - Level 5"
            />
            <CardHero
              image={character2}
              name="Player 1"
              role="Mage - Level 5"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
