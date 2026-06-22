/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Player, PlayerStats } from "../types";
import { computeLeaderboard } from "../utils/pairing";
import { Edit2, Save, Undo, Award, ShieldAlert, X } from "lucide-react";

interface LeaderboardScreenProps {
  players: Player[];
  rounds: any[];
  winPoints: number;
  drawPoints: number;
  lossPoints: number;
  onUpdateManualStats: (playerId: string, updatedStats: PlayerStats) => void;
  onNext: () => void;
}

export default function LeaderboardScreen({
  players,
  rounds,
  winPoints,
  drawPoints,
  lossPoints,
  onUpdateManualStats,
  onNext,
}: LeaderboardScreenProps) {
  // We compute the leaderboard dynamically from past rounds
  const originalLeaderboard = computeLeaderboard(players, rounds, winPoints, drawPoints, lossPoints);

  // Manual editing modal or row state
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editStatForm, setEditStatForm] = useState<PlayerStats | null>(null);

  const startEdit = (playerId: string, currentStats: PlayerStats) => {
    setEditingPlayerId(playerId);
    setEditStatForm({ ...currentStats });
  };

  const handleFieldChange = (field: keyof PlayerStats, val: number) => {
    if (!editStatForm) return;
    setEditStatForm({
      ...editStatForm,
      [field]: val,
    });
  };

  const saveEdit = () => {
    if (editingPlayerId && editStatForm) {
      // Recalculate points based on wins/draws/losses entered manually, or let them input manual points directly! Let's calculate automatically based on standard inputs to prevent confusion, but let them customize too.
      const pointsCalculated = (editStatForm.wins * winPoints) + (editStatForm.draws * drawPoints) + (editStatForm.losses * lossPoints);
      onUpdateManualStats(editingPlayerId, {
        ...editStatForm,
        points: pointsCalculated,
      });
      setEditingPlayerId(null);
      setEditStatForm(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-5 space-y-4">
      {/* Live Ranking Table */}
      <div className="flex-1 overflow-y-auto max-h-[460px] pr-1">
        <table className="w-full text-left border-collapse select-none">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              <th className="py-2.5 pl-2 text-center w-8">Rk</th>
              <th className="py-2.5">Player</th>
              <th className="py-2.5 text-center w-10">Pld</th>
              <th className="py-2.5 text-center w-18">W-D-L</th>
              <th className="py-2.5 text-center w-8">Rst</th>
              <th className="py-2.5 text-right pr-2 w-10">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {originalLeaderboard.map((item) => {
              const stats = item.stats;
              const isEditingThis = editingPlayerId === item.player.id;

              return (
                <tr
                  key={item.player.id}
                  className="hover:bg-slate-950/20 transition-all text-xs"
                >
                  {/* Rank Badge */}
                  <td className="py-3 text-center">
                    <span className={`w-5.5 h-5.5 rounded-full flex items-center justify-center font-black ${
                      item.rank === 1
                        ? "bg-amber-400 text-slate-950 text-[10px] shadow-[0_0_12px_rgba(251,191,36,0.3)]"
                        : item.rank === 2
                        ? "bg-slate-300 text-slate-950 text-[10px] shadow-[0_0_12px_rgba(203,213,225,0.3)]"
                        : item.rank === 3
                        ? "bg-amber-700 text-white text-[10px]"
                        : "text-slate-500 font-bold"
                    }`}>
                      {item.rank}
                    </span>
                  </td>

                  {/* Name + Action */}
                  <td className="py-3 font-semibold text-white">
                    <div className="flex items-center gap-1.5 max-w-[120px] md:max-w-none">
                      <span className="truncate">{item.player.name}</span>
                      <button
                        type="button"
                        onClick={() => startEdit(item.player.id, stats)}
                        className="text-slate-500 hover:text-emerald-400 transition-colors p-0.5 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>

                  {/* Played Games */}
                  <td className="py-3 text-center text-slate-300 font-mono font-medium">
                    {stats.gamesPlayed}
                  </td>

                  {/* Win-Draw-Loss Summary */}
                  <td className="py-3 text-center font-mono font-semibold text-slate-400 text-[11px]">
                    <span className="text-emerald-400">{stats.wins}</span>
                    <span>-</span>
                    <span className="text-slate-300">{stats.draws}</span>
                    <span>-</span>
                    <span className="text-rose-400">{stats.losses}</span>
                  </td>

                  {/* Rests */}
                  <td className="py-3 text-center font-mono text-slate-400 text-[11px]">
                    {stats.rests}
                  </td>

                  {/* Points */}
                  <td className="py-3 text-right pr-2 font-mono font-black text-emerald-400">
                    {stats.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* DETAILED STATS EDIT TRAY OVERLAY */}
      {editingPlayerId && editStatForm && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Undo className="w-4 h-4" />
                <span>Stat Adjustment</span>
              </div>
              <button
                onClick={() => {
                  setEditingPlayerId(null);
                  setEditStatForm(null);
                }}
                className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-sm font-extrabold text-white">
              Player: {players.find((p) => p.id === editingPlayerId)?.name}
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-1">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Played</label>
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-center text-white text-xs font-bold font-mono"
                  value={editStatForm.gamesPlayed}
                  onChange={(e) => handleFieldChange("gamesPlayed", parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Rests</label>
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-center text-white text-xs font-bold font-mono"
                  value={editStatForm.rests}
                  onChange={(e) => handleFieldChange("rests", parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Wins</label>
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-center text-emerald-400 text-xs font-bold font-mono"
                  value={editStatForm.wins}
                  onChange={(e) => handleFieldChange("wins", parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Draws</label>
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-center text-white text-xs font-bold font-mono"
                  value={editStatForm.draws}
                  onChange={(e) => handleFieldChange("draws", parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1 font-mono">Losses</label>
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-center text-rose-400 text-xs font-bold font-mono"
                  value={editStatForm.losses}
                  onChange={(e) => handleFieldChange("losses", parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-black uppercase block mb-1">Calculated Points</label>
                <div className="w-full bg-emerald-950/20 border border-emerald-900/40 rounded-lg p-2 text-center text-emerald-400 text-xs font-extrabold font-mono">
                  {(editStatForm.wins * winPoints) + (editStatForm.draws * drawPoints) + (editStatForm.losses * lossPoints)} pts
                </div>
              </div>
            </div>

            <button
              onClick={saveEdit}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer mt-2"
            >
              <Save className="w-4 h-4" />
              <span>Apply Score Adjustments</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Action Nav */}
      <div className="pt-2">
        <button
          onClick={onNext}
          type="button"
          className="w-full bg-emerald-500 text-slate-950 h-14 rounded-2xl font-black text-base shadow-[0_6px_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Setup Semi-Finals & Brackets</span>
          <Award className="w-5 h-5 stroke-[2]" />
        </button>
      </div>
    </div>
  );
}
