"use client";

import { useState } from "react";

export default function WaitingRoom() {
  const [players, setPlayers] = useState<string[]>([]);
  const maxPlayers = 4;
  const hasDM = true; // sementara default ada DM, nanti bisa dibuat toggle / AI DM

  const addPlayer = (name: string) => {
    if (players.length < maxPlayers) {
      setPlayers([...players, name]);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/img/bg1.jpg')" }}
    >
      <h1 className="text-4xl font-bold mb-6">⚔️ Waiting Room</h1>
      <p className="mb-4 text-lg">
        Menunggu pemain lain... (Maks {maxPlayers} pemain + 1 DM)
      </p>

      <div className="w-full max-w-md bg-black bg-opacity-60 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-3">Pemain Bergabung:</h2>
        <ul className="list-disc list-inside mb-4">
          {players.map((player, index) => (
            <li key={index}>{player}</li>
          ))}
        </ul>

        <button
          onClick={() => addPlayer(`Pemain ${players.length + 1}`)}
          disabled={players.length >= maxPlayers}
          className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold text-white disabled:opacity-50"
        >
          Tambah Pemain
        </button>
      </div>

      <div className="mt-6">
        {hasDM ? (
          <p className="text-green-400 font-semibold">✅ DM sudah siap</p>
        ) : (
          <p className="text-red-400 font-semibold">❌ DM belum tersedia</p>
        )}
      </div>

      {players.length === maxPlayers && hasDM && (
        <div className="mt-6">
          <button className="py-2 px-6 bg-green-600 hover:bg-green-700 rounded-lg font-bold">
            Mulai Game
          </button>
        </div>
      )}
    </div>
  );
}
