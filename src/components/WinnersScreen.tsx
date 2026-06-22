/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Player, PlayerStats } from "../types";
import { computeLeaderboard } from "../utils/pairing";
import { Trophy, Share2, AlertTriangle, RotateCcw, Copy, Check, Star } from "lucide-react";

interface WinnersScreenProps {
  players: Player[];
  rounds: any[];
  winningPair: [string, string] | null;
  winPoints: number;
  drawPoints: number;
  lossPoints: number;
  onResetEvent: () => void;
}

export default function WinnersScreen({
  players,
  rounds,
  winningPair,
  winPoints,
  drawPoints,
  lossPoints,
  onResetEvent,
}: WinnersScreenProps) {
  const [copied, setCopied] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Grab names
  const playerMap = useRef<Record<string, string>>({});
  useEffect(() => {
    const map: Record<string, string> = {};
    for (const p of players) {
      map[p.id] = p.name;
    }
    playerMap.current = map;
  }, [players]);

  const getPlayerName = (id: string) => playerMap.current[id] || id;

  const champ1Name = winningPair ? getPlayerName(winningPair[0]) : "TBD Champ";
  const champ2Name = winningPair ? getPlayerName(winningPair[1]) : "TBD Champ";

  // Compute final leaderboard
  const finalLeaderboard = computeLeaderboard(players, rounds, winPoints, drawPoints, lossPoints);

  // Share message composer
  const handleShareResult = () => {
    let msg = `🏆 *Noviun Padel Social Tournament* 🏆\n\n`;
    if (winningPair) {
      msg += `🥇 *GRAND CHAMPIONS* 🥇\n🎾 ${champ1Name} & ${champ2Name}\n\n`;
    }

    msg += `📊 *Final Leaderboard Standings*:\n`;
    finalLeaderboard.slice(0, 8).forEach((item, index) => {
      msg += `${index + 1}. ${item.player.name} (${item.stats.points} pts, W-D-L: ${item.stats.wins}-${item.stats.draws}-${item.stats.losses})\n`;
    });

    if (finalLeaderboard.length > 8) {
      msg += `...and ${finalLeaderboard.length - 8} more players participated!`;
    }

    msg += `\n🤖 Generated and timed using Noviun Padel. Great sets today everyone! 🎾💪`;

    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col p-5 space-y-4 text-center bg-slate-50/50">
      
      {/* 1. Victory Celebration Area */}
      <div className="bg-white border border-amber-200 rounded-3xl p-5 relative overflow-hidden select-none shadow-sm">
        {/* Confetti-like elements */}
        <div className="absolute top-2 left-6 text-amber-500 rotate-12 opacity-80 text-xl">✨</div>
        <div className="absolute top-6 right-6 text-amber-500 -rotate-12 opacity-80 text-xl">✨</div>
        <div className="absolute bottom-4 left-4 text-amber-500 opacity-60 text-xs">⭐</div>

        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mx-auto border border-amber-200/80 shadow-sm">
          <Trophy className="w-8 h-8" />
        </div>

        <h2 className="text-xs uppercase font-bold tracking-tight text-amber-700 mt-3.5">
          Tournament Champions
        </h2>

        {winningPair ? (
          <div className="mt-3 space-y-1">
            <div className="text-xl font-bold text-slate-800 leading-tight tracking-tight px-2">
              {champ1Name} <span className="text-xs text-amber-700">&amp;</span> {champ2Name}
            </div>
            <p className="text-[10px] text-amber-700 font-bold tracking-wider uppercase mt-1">
              🏆 Grand playoff winners
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-500 leading-normal mt-3 px-6 font-medium">
            Complete the final matchup in the brackets tab to populate the grand social champions!
          </p>
        )}
      </div>

      {/* 2. Compact Standings podium breakdown */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-2 select-none shadow-sm">
        <h3 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider text-left border-b border-slate-100 pb-2 flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-500" />
          <span>Award Podiums (Matches Stats)</span>
        </h3>

        <div className="grid grid-cols-3 gap-2 py-1">
          {/* Most Wins */}
          <div className="bg-slate-50 p-2.5 rounded-xl text-center border border-slate-100">
            <div className="text-[8px] uppercase tracking-wider font-bold text-slate-400 leading-none">
              Top Scorer
            </div>
            <div className="text-[11px] font-bold text-amber-700 mt-1 truncate">
              {finalLeaderboard[0]?.player.name || "N/A"}
            </div>
            <div className="text-[9px] font-bold text-slate-500 mt-0.5">
              {finalLeaderboard[0]?.stats.points || 0} pts
            </div>
          </div>

          {/* Social King (Most Draws / Active) */}
          <div className="bg-slate-50 p-2.5 rounded-xl text-center border border-slate-100">
            <div className="text-[8px] uppercase tracking-wider font-bold text-slate-400 leading-none">
              Most Games
            </div>
            <div className="text-[11px] font-bold text-indigo-700 mt-1 truncate">
              {finalLeaderboard.reduce((prev, curr) => (prev.stats.gamesPlayed > curr.stats.gamesPlayed ? prev : curr), finalLeaderboard[0])?.player.name || "N/A"}
            </div>
            <div className="text-[9px] font-bold text-slate-500 mt-0.5">
              {finalLeaderboard.reduce((prev, curr) => (prev.stats.gamesPlayed > curr.stats.gamesPlayed ? prev : curr), finalLeaderboard[0])?.stats.gamesPlayed || 0} sets
            </div>
          </div>

          {/* Rested Buddy */}
          <div className="bg-slate-50 p-2.5 rounded-xl text-center border border-slate-100">
            <div className="text-[8px] uppercase tracking-wider font-bold text-slate-400 leading-none">
              Chill Master
            </div>
            <div className="text-[11px] font-bold text-teal-700 mt-1 truncate">
              {finalLeaderboard.reduce((prev, curr) => (prev.stats.rests > curr.stats.rests ? prev : curr), finalLeaderboard[0])?.player.name || "N/A"}
            </div>
            <div className="text-[9px] font-bold text-slate-500 mt-0.5">
              {finalLeaderboard.reduce((prev, curr) => (prev.stats.rests > curr.stats.rests ? prev : curr), finalLeaderboard[0])?.stats.rests || 0} rests
            </div>
          </div>
        </div>
      </div>

      {/* 3. Messaging clipboard copy triggers */}
      <div className="space-y-2 select-none pt-2">
        <button
          onClick={handleShareResult}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white h-13 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Share2 className="w-4 h-4" />}
          <span>{copied ? "Copied Standings Summary!" : "Copy/Share Standings & Winners"}</span>
        </button>

        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full bg-white border border-slate-200 text-rose-600 hover:bg-rose-50/50 h-12 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Event Data</span>
        </button>
      </div>

      {/* DANGEROUS ACTION MODAL CONFIRMATION */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <div className="bg-white border border-slate-200 p-5 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex gap-2.5 text-rose-600 items-start text-left">
              <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-800">Full Deletion Notice</h4>
                <p className="text-xs text-slate-500 leading-normal mt-1 font-medium">
                  Are you absolutely certain you want to wipe all registered players, completed rounds, and leaderboard stats? This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold cursor-pointer transition-all"
              >
                No, Keep It
              </button>
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  onResetEvent();
                }}
                className="px-4 py-2 rounded-xl text-xs bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer transition-all shadow-sm"
              >
                Yes, Purge All Data
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
