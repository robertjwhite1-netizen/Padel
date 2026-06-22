/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Player, SemiFinals, Finals, PlayerStats } from "../types";
import { computeLeaderboard } from "../utils/pairing";
import { Trophy, HelpCircle, Users, ArrowRight, ShieldAlert, Check } from "lucide-react";

interface BracketsScreenProps {
  players: Player[];
  rounds: any[];
  semiFinals: SemiFinals | null;
  finals: Finals | null;
  winPoints: number;
  drawPoints: number;
  lossPoints: number;
  onUpdateSemiFinals: (sf: SemiFinals) => void;
  onUpdateFinals: (fi: Finals) => void;
  onCompletePlayoffs: (winningPair: [string, string]) => void;
  onGoToTab: (tab: any) => void;
}

export default function BracketsScreen({
  players,
  rounds,
  semiFinals,
  finals,
  winPoints,
  drawPoints,
  lossPoints,
  onUpdateSemiFinals,
  onUpdateFinals,
  onCompletePlayoffs,
  onGoToTab,
}: BracketsScreenProps) {
  const leaderboard = computeLeaderboard(players, rounds, winPoints, drawPoints, lossPoints);

  // Auto-generate helper
  const handleAutoGenerateSemis = () => {
    if (leaderboard.length < 8) {
      alert("You need at least 8 players registered to run semi-finals!");
      return;
    }

    const t1 = leaderboard[0].player.id; // Rank 1
    const t2 = leaderboard[1].player.id; // Rank 2
    const t3 = leaderboard[2].player.id; // Rank 3
    const t4 = leaderboard[3].player.id; // Rank 4
    const t5 = leaderboard[4].player.id; // Rank 5
    const t6 = leaderboard[5].player.id; // Rank 6
    const t7 = leaderboard[6].player.id; // Rank 7
    const t8 = leaderboard[7].player.id; // Rank 8

    const newSemis: SemiFinals = {
      semi1: {
        id: "semi1",
        pairA: [t1, t8], // 1 + 8
        pairB: [t4, t5], // 4 + 5
        result: "pending",
        courtNumber: 1,
      },
      semi2: {
        id: "semi2",
        pairA: [t2, t7], // 2 + 7
        pairB: [t3, t6], // 3 + 6
        result: "pending",
        courtNumber: 2,
      },
      isCompleted: false,
    };

    onUpdateSemiFinals(newSemis);
  };

  // Helper mappings
  const playerMap = useRef<Record<string, string>>({});
  useEffect(() => {
    const map: Record<string, string> = {};
    for (const p of players) {
      map[p.id] = p.name;
    }
    playerMap.current = map;
  }, [players]);

  const getPlayerName = (id: string) => playerMap.current[id] || "TBD Player";

  // Modify individual playoff cell in case player must leave
  const handleUpdateSemiPlayer = (semiKey: "semi1" | "semi2", pairKey: "pairA" | "pairB", index: 0 | 1, val: string) => {
    if (!semiFinals) return;
    const cloned = { ...semiFinals };

    const pair = cloned[semiKey][pairKey];
    const newPair: [string, string] = index === 0 ? [val, pair[1]] : [pair[0], val];
    cloned[semiKey][pairKey] = newPair;

    onUpdateSemiFinals(cloned);
  };

  const recordSemiResult = (semiKey: "semi1" | "semi2", winner: "pairA" | "pairB") => {
    if (!semiFinals) return;
    const cloned = { ...semiFinals };
    cloned[semiKey].result = winner;

    // Check if both completed
    const match1Done = cloned.semi1.result !== "pending";
    const match2Done = cloned.semi2.result !== "pending";
    cloned.isCompleted = match1Done && match2Done;

    onUpdateSemiFinals(cloned);

    // If both done, automatically suggest generating finals!
    if (cloned.isCompleted) {
      const winner1 = cloned.semi1.result === "pairA" ? cloned.semi1.pairA : cloned.semi1.pairB;
      const winner2 = cloned.semi2.result === "pairA" ? cloned.semi2.pairA : cloned.semi2.pairB;

      const newFinals: Finals = {
        id: "playoff-final",
        pairA: winner1,
        pairB: winner2,
        result: "pending",
        courtNumber: 1,
        isCompleted: false,
      };
      onUpdateFinals(newFinals);
    }
  };

  const handleUpdateFinalPlayer = (pairKey: "pairA" | "pairB", index: 0 | 1, val: string) => {
    if (!finals) return;
    const cloned = { ...finals };

    const pair = cloned[pairKey];
    const newPair: [string, string] = index === 0 ? [val, pair[1]] : [pair[0], val];
    cloned[pairKey] = newPair;

    onUpdateFinals(cloned);
  };

  const recordFinalResult = (winner: "pairA" | "pairB") => {
    if (!finals) return;
    const cloned = { ...finals };
    cloned.result = winner;
    cloned.isCompleted = true;
    onUpdateFinals(cloned);

    const winningPair = winner === "pairA" ? cloned.pairA : cloned.pairB;
    onCompletePlayoffs(winningPair);
    onGoToTab("winners");
  };

  return (
    <div className="flex-1 flex flex-col p-5 space-y-4 bg-slate-50/50">
      {/* 1. Playoff Setup triggers */}
      {!semiFinals ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 bg-white border border-dashed border-slate-200 rounded-3xl space-y-4 shadow-sm">
          <div className="p-3 bg-green-50 rounded-full text-green-600 border border-green-100">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Generate Playoffs (Semi-finals)</h3>
            <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
              Based on the current standings, the top 8 players will pair up to play the semi-finals:
            </p>
            <div className="bg-slate-50 border border-slate-200 text-[10.5px] p-3 rounded-xl text-left font-mono mt-3 text-slate-600 space-y-1">
              <div>• Semi 1: Rank 1 + 8 vs Rank 4 + 5</div>
              <div>• Semi 2: Rank 2 + 7 vs Rank 3 + 6</div>
            </div>
          </div>
          <button
            onClick={handleAutoGenerateSemis}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer"
          >
            Generate Semi-final Matches
          </button>
        </div>
      ) : (
        <div className="space-y-5 flex-1 overflow-y-auto max-h-[500px] pr-1">
          {/* SEMI-FINAL CARD */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
              <Users className="w-4 h-4 text-green-600" />
              <span>Two Semi-final Brackets</span>
            </h3>

            {/* SEMI 1 GRID CELL */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 select-none">
                <span className="font-bold text-[11px] text-slate-400 uppercase tracking-tighter">
                  Semi-final Cup 1 (Court {semiFinals.semi1.courtNumber})
                </span>
                <span className="text-[9px] px-2 py-0.5 bg-slate-50 rounded text-slate-500 font-bold uppercase">
                  Balanced Seeding
                </span>
              </div>

              {/* Competitors and Player select fields if manual substitution is needed */}
              <div className="grid grid-cols-11 gap-1 items-center">
                {/* Team 1 (Rank 1 & 8) */}
                <div className="col-span-5 text-center space-y-1">
                  <select
                    className="w-full bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 rounded p-1.5 focus:outline-none focus:border-green-500"
                    value={semiFinals.semi1.pairA[0]}
                    onChange={(e) => handleUpdateSemiPlayer("semi1", "pairA", 0, e.target.value)}
                  >
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="w-full bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 rounded p-1.5 focus:outline-none focus:border-green-500"
                    value={semiFinals.semi1.pairA[1]}
                    onChange={(e) => handleUpdateSemiPlayer("semi1", "pairA", 1, e.target.value)}
                  >
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <span className="text-[9px] text-green-700 uppercase tracking-tight font-bold block mt-1">
                    Pair A
                  </span>
                </div>

                <div className="col-span-1 text-center font-bold text-slate-300 text-xs select-none">
                  vs
                </div>

                {/* Team 2 (Rank 4 & 5) */}
                <div className="col-span-5 text-center space-y-1">
                  <select
                    className="w-full bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 rounded p-1.5 focus:outline-none focus:border-green-500"
                    value={semiFinals.semi1.pairB[0]}
                    onChange={(e) => handleUpdateSemiPlayer("semi1", "pairB", 0, e.target.value)}
                  >
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="w-full bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 rounded p-1.5 focus:outline-none focus:border-green-500"
                    value={semiFinals.semi1.pairB[1]}
                    onChange={(e) => handleUpdateSemiPlayer("semi1", "pairB", 1, e.target.value)}
                  >
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <span className="text-[9px] text-green-700 uppercase tracking-tight font-bold block mt-1">
                    Pair B
                  </span>
                </div>
              </div>

              {/* Big Touch buttons for results */}
              <div className="grid grid-cols-2 gap-2 pt-1 select-none">
                <button
                  type="button"
                  onClick={() => recordSemiResult("semi1", "pairA")}
                  className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-tight text-center border transition-all cursor-pointer ${
                    semiFinals.semi1.result === "pairA"
                      ? "bg-green-500 text-white border-green-500 font-bold"
                      : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  Pair A Wins
                </button>
                <button
                  type="button"
                  onClick={() => recordSemiResult("semi1", "pairB")}
                  className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-tight text-center border transition-all cursor-pointer ${
                    semiFinals.semi1.result === "pairB"
                      ? "bg-green-500 text-white border-green-500 font-bold"
                      : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  Pair B Wins
                </button>
              </div>
            </div>

            {/* SEMI 2 GRID CELL */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 select-none">
                <span className="font-bold text-[11px] text-slate-400 uppercase tracking-tighter">
                  Semi-final Cup 2 (Court {semiFinals.semi2.courtNumber})
                </span>
                <span className="text-[9px] px-2 py-0.5 bg-slate-50 rounded text-slate-500 font-bold uppercase">
                  Balanced Seeding
                </span>
              </div>

              {/* Competitors and dropdown overrides */}
              <div className="grid grid-cols-11 gap-1 items-center">
                {/* Team 1 (Rank 2 & 7) */}
                <div className="col-span-5 text-center space-y-1">
                  <select
                    className="w-full bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 rounded p-1.5 focus:outline-none focus:border-green-500"
                    value={semiFinals.semi2.pairA[0]}
                    onChange={(e) => handleUpdateSemiPlayer("semi2", "pairA", 0, e.target.value)}
                  >
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="w-full bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 rounded p-1.5 focus:outline-none focus:border-green-500"
                    value={semiFinals.semi2.pairA[1]}
                    onChange={(e) => handleUpdateSemiPlayer("semi2", "pairA", 1, e.target.value)}
                  >
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <span className="text-[9px] text-green-700 uppercase tracking-tight font-bold block mt-1">
                    Pair A
                  </span>
                </div>

                <div className="col-span-1 text-center font-bold text-slate-300 text-xs select-none">
                  vs
                </div>

                {/* Team 2 (Rank 3 & 6) */}
                <div className="col-span-12 col-span-5 text-center space-y-1">
                  <select
                    className="w-full bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 rounded p-1.5 focus:outline-none focus:border-green-500"
                    value={semiFinals.semi2.pairB[0]}
                    onChange={(e) => handleUpdateSemiPlayer("semi2", "pairB", 0, e.target.value)}
                  >
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="w-full bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 rounded p-1.5 focus:outline-none focus:border-green-500"
                    value={semiFinals.semi2.pairB[1]}
                    onChange={(e) => handleUpdateSemiPlayer("semi2", "pairB", 1, e.target.value)}
                  >
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <span className="text-[9px] text-green-700 uppercase tracking-tight font-bold block mt-1">
                    Pair B
                  </span>
                </div>
              </div>

              {/* Big Touch buttons for results */}
              <div className="grid grid-cols-2 gap-2 pt-1 select-none">
                <button
                  type="button"
                  onClick={() => recordSemiResult("semi2", "pairA")}
                  className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-tight text-center border transition-all cursor-pointer ${
                    semiFinals.semi2.result === "pairA"
                      ? "bg-green-500 text-white border-green-500 font-bold"
                      : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  Pair A Wins
                </button>
                <button
                  type="button"
                  onClick={() => recordSemiResult("semi2", "pairB")}
                  className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-tight text-center border transition-all cursor-pointer ${
                    semiFinals.semi2.result === "pairB"
                      ? "bg-green-500 text-white border-green-500 font-bold"
                      : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  Pair B Wins
                </button>
              </div>
            </div>
          </div>

          {/* CASUAL GAMES / SPECTATING ANNOUNCEMENT */}
          <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200/50">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              📣 Non-Qualifiers Casuals
            </span>
            <p className="text-[11px] text-slate-500 mt-1 leading-normal font-medium">
              Players ranked 9+ can use Court 3 and Court 4 for relaxed casual friendly sets, or rest and cheer on the semi-finalists!
            </p>
          </div>

          {/* PLAYOFF FINAL SECTION - AUTO REVEALS UPON SEMI COMPLETION */}
          {finals && (
            <div className="border-t border-slate-205 pt-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight flex items-center gap-1.5 select-none animate-bounce">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>The Grand Final</span>
              </h3>

              <div className="bg-white p-4 rounded-2xl border border-amber-250/70 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-105 select-none">
                  <span className="font-bold text-[12px] text-amber-800 uppercase tracking-tight">
                    Championship Match (Court 1)
                  </span>
                  <span className="text-[9px] px-2 py-0.5 bg-amber-50 text-amber-700 font-bold uppercase tracking-wider animate-pulse rounded">
                    LIVE FINAL
                  </span>
                </div>

                {/* Final competitors layout */}
                <div className="grid grid-cols-11 gap-1 items-center">
                  {/* Winner Semi 1 */}
                  <div className="col-span-5 text-center space-y-1">
                    <select
                      className="w-full bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 rounded p-1.5 focus:outline-none focus:border-green-500"
                      value={finals.pairA[0]}
                      onChange={(e) => handleUpdateFinalPlayer("pairA", 0, e.target.value)}
                    >
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <select
                      className="w-full bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 rounded p-1.5 focus:outline-none focus:border-green-500"
                      value={finals.pairA[1]}
                      onChange={(e) => handleUpdateFinalPlayer("pairA", 1, e.target.value)}
                    >
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight block mt-1">
                      Semi 1 Champions
                    </span>
                  </div>

                  <div className="col-span-1 text-center font-bold text-slate-300 text-xs select-none">
                    vs
                  </div>

                  {/* Winner Semi 2 */}
                  <div className="col-span-5 text-center space-y-1">
                    <select
                      className="w-full bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 rounded p-1.5 focus:outline-none focus:border-green-500"
                      value={finals.pairB[0]}
                      onChange={(e) => handleUpdateFinalPlayer("pairB", 0, e.target.value)}
                    >
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <select
                      className="w-full bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 rounded p-1.5 focus:outline-none focus:border-green-500"
                      value={finals.pairB[1]}
                      onChange={(e) => handleUpdateFinalPlayer("pairB", 1, e.target.value)}
                    >
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight block mt-1">
                      Semi 2 Champions
                    </span>
                  </div>
                </div>

                {/* Winner actions */}
                <div className="grid grid-cols-2 gap-2 pt-2 select-none">
                  <button
                    onClick={() => recordFinalResult("pairA")}
                    className={`py-3.5 rounded-xl text-xs font-bold uppercase tracking-tight border transition-all cursor-pointer ${
                      finals.result === "pairA"
                        ? "bg-amber-500 text-white border-amber-500 font-bold shadow-sm"
                        : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    🏆 Pair A Won Final
                  </button>
                  <button
                    onClick={() => recordFinalResult("pairB")}
                    className={`py-3.5 rounded-xl text-xs font-bold uppercase tracking-tight border transition-all cursor-pointer ${
                      finals.result === "pairB"
                        ? "bg-amber-500 text-white border-amber-500 font-bold shadow-sm"
                        : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    🏆 Pair B Won Final
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
