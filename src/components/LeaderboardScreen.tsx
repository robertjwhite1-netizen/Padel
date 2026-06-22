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
  manualStats: Record<string, PlayerStats>;
  onUpdateManualStats: (playerId: string, updatedStats: PlayerStats) => void;
  onNext: () => void;
  onGoToTab: (tab: any) => void;
}

export default function LeaderboardScreen({
  players,
  rounds,
  winPoints,
  drawPoints,
  lossPoints,
  manualStats,
  onUpdateManualStats,
  onNext,
  onGoToTab,
}: LeaderboardScreenProps) {
  // We compute the leaderboard dynamically from past rounds and manual stats overrides
  const originalLeaderboard = computeLeaderboard(players, rounds, winPoints, drawPoints, lossPoints, manualStats);

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
    <div className="flex-1 flex flex-col p-5 space-y-4 bg-slate-50/50">
      {/* Live Ranking Table */}
      <div className="flex-1 overflow-y-auto max-h-[460px] pr-1">
        <table className="w-full text-left border-collapse select-none">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <th className="py-2.5 pl-2 text-center w-8">Rk</th>
              <th className="py-2.5">Player</th>
              <th className="py-2.5 text-center w-10">Pld</th>
              <th className="py-2.5 text-center w-18">W-D-L</th>
              <th className="py-2.5 text-center w-8">Rst</th>
              <th className="py-2.5 text-right pr-2 w-10">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {originalLeaderboard.map((item) => {
              const stats = item.stats;
              const isEditingThis = editingPlayerId === item.player.id;

              return (
                <tr
                  key={item.player.id}
                  className="hover:bg-slate-100/50 transition-all text-xs"
                >
                  {/* Rank Badge */}
                  <td className="py-3 text-center">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      item.rank === 1
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : item.rank === 2
                        ? "bg-slate-100 text-slate-800 border border-slate-200"
                        : item.rank === 3
                        ? "bg-orange-100 text-orange-850 border border-orange-200"
                        : "text-slate-400 font-bold"
                    }`}>
                      {item.rank}
                    </span>
                  </td>

                  {/* Name + Action */}
                  <td className="py-3 font-semibold text-slate-800">
                    <div className="flex items-center gap-1.5 max-w-[120px] md:max-w-none">
                      <span className="truncate">{item.player.name}</span>
                      <button
                        type="button"
                        onClick={() => startEdit(item.player.id, stats)}
                        className="text-slate-400 hover:text-green-600 transition-colors p-0.5 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>

                  {/* Played Games */}
                  <td className="py-3 text-center text-slate-600 font-mono font-medium">
                    {stats.gamesPlayed}
                  </td>

                  {/* Win-Draw-Loss Summary */}
                  <td className="py-3 text-center font-mono font-semibold text-slate-400 text-[11px]">
                    <span className="text-green-600">{stats.wins}</span>
                    <span>-</span>
                    <span className="text-slate-400">{stats.draws}</span>
                    <span>-</span>
                    <span className="text-rose-500">{stats.losses}</span>
                  </td>

                  {/* Rests */}
                  <td className="py-3 text-center font-mono text-slate-500 text-[11px]">
                    {stats.rests}
                  </td>

                  {/* Points */}
                  <td className="py-3 text-right pr-2 font-mono font-bold text-green-700">
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
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <div className="bg-white border border-slate-205 p-5 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs uppercase tracking-tight">
                <Undo className="w-4 h-4 text-slate-400" />
                <span>Stat Adjustment</span>
              </div>
              <button
                onClick={() => {
                  setEditingPlayerId(null);
                  setEditStatForm(null);
                }}
                className="text-slate-400 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-sm font-bold text-slate-800">
              Player: {players.find((p) => p.id === editingPlayerId)?.name}
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-1">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Played</label>
                <input
                  type="number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-center text-slate-700 text-xs font-bold font-mono shadow-sm"
                  value={editStatForm.gamesPlayed}
                  onChange={(e) => handleFieldChange("gamesPlayed", parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Rests</label>
                <input
                  type="number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-center text-slate-700 text-xs font-bold font-mono shadow-sm"
                  value={editStatForm.rests}
                  onChange={(e) => handleFieldChange("rests", parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Wins</label>
                <input
                  type="number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-center text-green-600 text-xs font-bold font-mono shadow-sm"
                  value={editStatForm.wins}
                  onChange={(e) => handleFieldChange("wins", parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Draws</label>
                <input
                  type="number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-center text-slate-700 text-xs font-bold font-mono shadow-sm"
                  value={editStatForm.draws}
                  onChange={(e) => handleFieldChange("draws", parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1 font-mono">Losses</label>
                <input
                  type="number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-center text-rose-500 text-xs font-bold font-mono shadow-sm"
                  value={editStatForm.losses}
                  onChange={(e) => handleFieldChange("losses", parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Calculated Points</label>
                <div className="w-full bg-green-50 border border-green-100 rounded-lg p-2 text-center text-green-700 text-xs font-bold font-mono shadow-sm">
                  {(editStatForm.wins * winPoints) + (editStatForm.draws * drawPoints) + (editStatForm.losses * lossPoints)} pts
                </div>
              </div>
            </div>

            <button
              onClick={saveEdit}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer mt-2"
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
          onClick={() => {
            const totalRoundsCount = rounds.length;
            const isLastRoundCompleted = totalRoundsCount > 0 && rounds[totalRoundsCount - 1].isCompleted;
            if (totalRoundsCount >= 5 && isLastRoundCompleted) {
              onNext();
            } else {
              onGoToTab("rounds");
            }
          }}
          type="button"
          className="w-full bg-slate-900 hover:bg-slate-800 text-white h-14 rounded-2xl font-bold text-base shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>
            {(() => {
              const totalRoundsCount = rounds.length;
              const isLastRoundCompleted = totalRoundsCount > 0 && rounds[totalRoundsCount - 1].isCompleted;
              if (totalRoundsCount < 5 || !isLastRoundCompleted) {
                if (isLastRoundCompleted) {
                  return `Proceed to Round ${totalRoundsCount + 1}`;
                } else {
                  return `Back to Round ${totalRoundsCount || 1} Play`;
                }
              }
              return "Setup Semi-Finals & Brackets";
            })()}
          </span>
          <Award className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
