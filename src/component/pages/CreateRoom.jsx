import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Lightweight CreateRoom (localStorage-backed participants).
 * - minimal helpers, small footprint
 * - adds/removes current user on mount/unmount
 * - updates on "storage" events so other tabs reflect changes
 * - host-only Start Game + Kick
 */

const key = (roomId) => `room_${roomId}_participants`;
const read = (roomId) => {
  try { return JSON.parse(localStorage.getItem(key(roomId))) || []; } catch { return []; }
};
const write = (roomId, list) => localStorage.setItem(key(roomId), JSON.stringify(list));
const genId = () => Math.random().toString(36).slice(2, 9);

export default function CreateRoom() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { roomId, hostName, password, nfPlayer, yourName } = state || {};

  useEffect(() => { if (!roomId) navigate("/", { replace: true }); }, [roomId, navigate]);

  const meName = useMemo(() => yourName || hostName || `Guest-${genId().slice(0,4)}`, [yourName, hostName]);
  const meId = useMemo(() => genId(), []);

  const [parts, setParts] = useState(() => (roomId ? read(roomId) : []));

  const amHost = Boolean(hostName && meName === hostName);

  useEffect(() => {
    if (!roomId) return;
    const cur = read(roomId);
    const exists = cur.some(p => p.clientId === meId || p.name === meName);
    const updated = exists ? cur : [...cur, { clientId: meId, name: meName, isHost: amHost }];
    write(roomId, updated);
    setParts(updated);

    const onStorage = (e) => { if (e.key === key(roomId)) setParts(read(roomId)); };
    window.addEventListener("storage", onStorage);

    const cleanup = () => {
      const after = read(roomId).filter(p => p.clientId !== meId);
      write(roomId, after);
      // dispatch synthetic storage so same-tab listeners update UI
      window.dispatchEvent(new StorageEvent("storage", { key: key(roomId) }));
    };
    window.addEventListener("beforeunload", cleanup);

    return () => { window.removeEventListener("storage", onStorage); window.removeEventListener("beforeunload", cleanup); cleanup(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, meId, meName, amHost]);

  const kick = (clientId) => {
    if (!amHost) return;
    const after = read(roomId).filter(p => p.clientId !== clientId);
    write(roomId, after);
    setParts(after);
    window.dispatchEvent(new StorageEvent("storage", { key: key(roomId) }));
  };

  const start = () => { if (!amHost) return; navigate("/game", { state: { roomId, participants: parts } }); };
  const leave = () => { const after = read(roomId).filter(p => p.clientId !== meId); write(roomId, after); navigate("/", { replace: true }); };
  const copyInvite = () => navigator.clipboard?.writeText(roomId ? `${locationOrigin()}/Room?roomId=${roomId}` : window.location.href);
  function locationOrigin(){ return window.location.origin.replace(/\/$/, ""); }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Room: <span className="font-mono ml-2">{roomId ?? "—"}</span></h1>
            <div className="text-sm text-slate-400 mt-2">
              Host: {hostName ?? "—"} · Password: <span className="font-mono">{password ?? "—"}</span> · Slots: {nfPlayer ?? 4}
              <div className="mt-1 text-xs">You: {meName}{amHost ? " (Host)" : ""}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={copyInvite} className="px-3 py-2 bg-indigo-600 rounded">Copy Invite</button>
            <button onClick={() => navigate("/")} className="px-3 py-2 border rounded">Home</button>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <section className="md:col-span-2 bg-slate-800 p-4 rounded">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Players ({parts.length})</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {parts.map(p => (
                <div key={p.clientId} className="bg-slate-700 p-3 rounded text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 mx-auto flex items-center justify-center text-xl font-bold">
                    {p.name?.[0] ?? "?"}
                  </div>
                  <div className="mt-2">{p.name}{p.isHost ? " (Host)" : ""}</div>
                  <div className="mt-2">
                    {amHost && !p.isHost && <button onClick={() => kick(p.clientId)} className="text-xs px-2 py-1 border rounded text-red-400">Kick</button>}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button onClick={() => {}} className="px-3 py-2 border rounded">Add Bot</button>
              <div className="text-sm text-slate-400">Share invite to let others join.</div>
            </div>
          </section>

          <aside className="bg-slate-800 p-4 rounded flex flex-col gap-3">
            <button onClick={start} disabled={!amHost} className={`py-2 rounded font-semibold ${amHost ? "bg-amber-400 text-slate-900" : "bg-slate-700 text-slate-400 cursor-not-allowed"}`}>Start Game</button>
            <button onClick={leave} className="py-2 rounded bg-red-600 text-white">Leave Room</button>
            <div className="text-xs text-slate-400 mt-2">Waiting for host to start</div>
          </aside>
        </main>
      </div>
    </div>
  );
}
