import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const TILE_COUNT = 16;
const PARTICIPANTS_KEY = (roomId) => `room_${roomId}_participants`;
const GAME_KEY = (roomId) => `room_${roomId}_game`;

const readJson = (k) => {
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
const writeJson = (k, v) => localStorage.setItem(k, JSON.stringify(v));

const genUniquePositions = (count, avoid = []) => {
  const out = new Set();
  while (out.size < count) {
    const n = Math.floor(Math.random() * TILE_COUNT) + 1;
    if (!avoid.includes(n)) out.add(n);
  }
  return Array.from(out);
};

export default function Game() {
  const { state } = useLocation();
  const navigate = useNavigate();
  // try to get roomId from state first, else from URL ?roomId=
  const roomIdFromState = state?.roomId;
  const params = new URLSearchParams(window.location.search);
  const roomIdFromUrl = params.get("roomId");
  const roomId = roomIdFromState || roomIdFromUrl;

  const [participants, setParticipants] = useState(() => (roomId ? readJson(PARTICIPANTS_KEY(roomId)) || [] : []));
  const [gameState, setGameState] = useState(() => (roomId ? readJson(GAME_KEY(roomId)) : null));
  const [turn, setTurn] = useState(0);

  // redirect home if no roomId
  useEffect(() => {
    if (!roomId) navigate("/", { replace: true });
  }, [roomId, navigate]);

  // react to participants or game changes in other tabs
  useEffect(() => {
    if (!roomId) return;
    const onStorage = (e) => {
      if (e.key === PARTICIPANTS_KEY(roomId)) setParticipants(readJson(PARTICIPANTS_KEY(roomId)) || []);
      if (e.key === GAME_KEY(roomId)) setGameState(readJson(GAME_KEY(roomId)));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [roomId]);

  // If game not initialized, host who started game will create game state.
  // If state contains participants & roomId (passed from CreateRoom start), use it.
  useEffect(() => {
    if (!roomId) return;
    // ensure participants are fresh
    const existingParticipants = readJson(PARTICIPANTS_KEY(roomId)) || [];
    setParticipants(existingParticipants);

    // if game already exists use it
    const existingGame = readJson(GAME_KEY(roomId));
    if (existingGame) {
      setGameState(existingGame);
      return;
    }

    // if the navigator came with state.participants (host clicked Start Game) -> initialize game
    if (state?.participants && state.roomId === roomId) {
      const playersList = state.participants;
      // avoid diamond conflicting with start positions
      const diamond = Math.floor(Math.random() * TILE_COUNT) + 1;
      const startPositions = genUniquePositions(playersList.length, [diamond]);
      const mapping = playersList.map((p, i) => ({ clientId: p.clientId, name: p.name, pos: startPositions[i] }));
      const gs = { diamond, players: mapping, startedAt: Date.now() };
      writeJson(GAME_KEY(roomId), gs);
      setGameState(gs);
      return;
    }

    // if we reach here and no state participants, do nothing and wait (host should start)
  }, [roomId, state]);

  // helper: get players mapped to positions (gameState might be null until host starts)
  const playersByTile = useMemo(() => {
    if (!gameState) return {};
    return gameState.players.reduce((acc, p) => {
      acc[p.pos] = acc[p.pos] || [];
      acc[p.pos].push(p);
      return acc;
    }, {});
  }, [gameState]);

  const rollDice = () => {
    if (!gameState) return alert("Game not started yet (waiting for host).");
    const dice = Math.floor(Math.random() * 6) + 1;
    // move current player's pawn
    const gs = { ...gameState };
    const currentPlayer = gs.players[turn];
    let next = currentPlayer.pos + dice;
    if (next > TILE_COUNT) {
      next = next % TILE_COUNT;
      if (next === 0) next = TILE_COUNT;
    }
    currentPlayer.pos = next;

    // save back and notify others
    writeJson(GAME_KEY(roomId), gs);
    // dispatch a synthetic storage event so same-tab listeners update immediately
    window.dispatchEvent(new StorageEvent("storage", { key: GAME_KEY(roomId) }));

    setGameState(gs);

    // check diamond
    if (next === gs.diamond) {
      alert(`🎉 ${currentPlayer.name} found the diamond!`);
      // optional: clear game or keep it. We'll keep it and stop further moves.
      return;
    }

    // next turn
    setTurn((t) => (t + 1) % gs.players.length);
  };

  // UI: simple 4x4 grid
  const tiles = Array.from({ length: TILE_COUNT }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center p-6">
      <div className="max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Room: {roomId}</h2>
            <div className="text-sm text-gray-600">Players: {participants.length} — Game started: {gameState ? "Yes" : "No"}</div>
          </div>
          <div>
            <button onClick={() => navigate("/")} className="px-3 py-2 bg-gray-200 rounded">Home</button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {tiles.map((n) => (
            <div key={n} className="relative h-20 rounded-lg bg-amber-500 flex items-center justify-center text-white font-bold">
              {gameState?.diamond === n ? "💎" : n}
              <div className="absolute bottom-1 left-1 right-1 flex justify-center gap-1 text-xs">
                {(playersByTile[n] || []).map((p) => (
                  <div key={p.clientId} className="px-2 py-1 rounded bg-white text-black text-xs font-bold">
                    {p.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={rollDice} className="px-4 py-2 bg-amber-600 text-white rounded">Roll Dice</button>
          <div>Turn: {gameState ? gameState.players[turn].name : "—"}</div>
        </div>
      </div>
    </div>
  );
}
