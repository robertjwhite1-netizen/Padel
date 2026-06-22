/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Player } from "../types";
import { Plus, Trash2, ShieldAlert, Shuffle, Check, Edit2, Play } from "lucide-react";

interface PlayersScreenProps {
  players: Player[];
  courtsCount: number;
  onAddPlayer: (name: string) => void;
  onUpdatePlayer: (id: string, updates: Partial<Player>) => void;
  onDeletePlayer: (id: string) => void;
  onShufflePlayers: () => void;
  onNext: () => void;
}

export default function PlayersScreen({
  players,
  courtsCount,
  onAddPlayer,
  onUpdatePlayer,
  onDeletePlayer,
  onShufflePlayers,
  onNext,
}: PlayersScreenProps) {
  const [newPlayerName, setNewPlayerName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    onAddPlayer(newPlayerName.trim());
    setNewPlayerName("");
  };

  const startEditing = (player: Player) => {
    setEditingId(player.id);
    setEditingValue(player.name);
  };

  const saveEditing = (id: string) => {
    if (editingValue.trim()) {
      onUpdatePlayer(id, { name: editingValue.trim() });
    }
    setEditingId(null);
  };

  const activePlayers = players.filter((p) => p.isAvailable);
  const totalCount = players.length;
  const activeCount = activePlayers.length;

  const targetPlayers = courtsCount * 4;
  const remainder = activeCount % 4;
  const playableCourts = Math.min(courtsCount, Math.floor(activeCount / 4));
  const activePlaying = playableCourts * 4;
  const activeResting = activeCount - activePlaying;

  // Render player count alert/status badge
  const renderCourtDiagnostics = () => {
    if (activeCount < 4) {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex gap-2.5 items-start">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-amber-800 uppercase tracking-tighter">
              More Players Required
            </div>
            <p className="text-[11px] text-amber-700/80 mt-1 leading-normal">
              You currently have <strong>{activeCount} active players</strong>. You need at least 4 active players to match up on Court 1.
            </p>
          </div>
        </div>
      );
    }

    if (remainder !== 0) {
      return (
        <div className="bg-green-55/40 bg-green-50 border border-green-150 rounded-xl p-3.5 flex gap-2.5 items-start font-medium">
          <ShieldAlert className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-green-800 uppercase tracking-tighter">
              Optimal Rotation Config
            </div>
            <p className="text-[11px] text-green-700/80 mt-1 leading-normal">
              With <strong>{activeCount} active players</strong>: {activePlaying} will play on {playableCourts} courts, leaving <strong>{activeResting} resting</strong> each round on a fair rotation cycle.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-green-50 border border-green-150 rounded-xl p-3.5 flex gap-2.5 items-start font-medium">
        <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-bold text-green-800 uppercase tracking-tighter">
            Perfect Court Matching!
          </div>
          <p className="text-[11px] text-green-700/80 mt-1 leading-normal">
            Exactly <strong>{activeCount} players</strong> are active, perfectly filling {playableCourts} courts with zero idle rest players this round!
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col p-5 space-y-5 bg-slate-50/50">
      {/* Dynamic Diagnostic Area */}
      {renderCourtDiagnostics()}

      {/* Add New Player */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-semibold focus:outline-none focus:border-green-500 transition-colors shadow-sm"
          placeholder="New Player Name..."
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
        />
        <button
          type="submit"
          disabled={!newPlayerName.trim()}
          className="bg-slate-900 disabled:opacity-45 text-white px-4 rounded-xl flex items-center justify-center font-bold active:scale-95 transition-all cursor-pointer shadow-sm hover:bg-slate-800"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </form>

      {/* Roster Controls */}
      <div className="flex items-center justify-between col-span-2 select-none">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
            Player Roster
          </span>
          <p className="text-[10px] text-slate-500 font-semibold">
            {activeCount} Active / {totalCount} Total Players
          </p>
        </div>
        <button
          type="button"
          onClick={onShufflePlayers}
          className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all active:scale-95 cursor-pointer shadow-sm shadow-slate-100/40"
        >
          <Shuffle className="w-3.5 h-3.5 text-slate-500" />
          <span>Shuffle</span>
        </button>
      </div>

      {/* Player List */}
      <div className="flex-1 overflow-y-auto space-y-2 max-h-[340px] pr-1">
        {players.length === 0 ? (
          <div className="text-center py-8 bg-white border border-dashed border-slate-200 rounded-2xl">
            <p className="text-slate-400 text-sm font-medium">No players added yet.</p>
            <p className="text-slate-500 text-[11px] mt-1">Add players above to start.</p>
          </div>
        ) : (
          players.map((p, index) => {
            const isEditing = editingId === p.id;
            return (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  p.isAvailable
                    ? "bg-white border-slate-200/80 text-slate-800 shadow-sm"
                    : "bg-slate-100/60 border-slate-200/45 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {/* Avatar Index */}
                  <span className="text-xs font-extrabold text-slate-400 select-none w-4 text-right">
                    {index + 1}
                  </span>

                  {/* Name section / edit box */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full bg-slate-50 border border-green-500 rounded px-2 py-0.5 text-xs font-bold text-slate-800 focus:outline-none"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={() => saveEditing(p.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEditing(p.id);
                        }}
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold truncate">{p.name}</span>
                        <button
                          type="button"
                          onClick={() => startEditing(p)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <span className="text-[9px] block uppercase font-bold text-slate-400 tracking-wide">
                      {p.isAvailable ? "Available" : "Sitting Out 💤"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 select-none">
                  {/* Available Switch Toggle */}
                  <button
                    type="button"
                    onClick={() => onUpdatePlayer(p.id, { isAvailable: !p.isAvailable })}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      p.isAvailable
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-white border-slate-200 text-slate-400"
                    }`}
                  >
                    {p.isAvailable ? "Active" : "Out"}
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => onDeletePlayer(p.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Continue Action */}
      <div className="pt-2">
        <button
          onClick={onNext}
          disabled={activeCount < 4}
          type="button"
          className="w-full bg-slate-900 disabled:opacity-40 text-white h-14 rounded-2xl font-bold text-base shadow-md hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Proceed to Matchups</span>
          <Play className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
