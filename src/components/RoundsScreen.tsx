/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Round, Matchup, Player } from "../types";
import { ClickAwayListener } from "react"; // wait, do not use not pre-installed libraries without installation. Use custom plain React handlers or standard buttons.
import { Play, Pause, RotateCcw, AlertTriangle, Check, RefreshCw, ChevronDown, ListFilter, Flame, Timer, Award } from "lucide-react";

interface RoundsScreenProps {
  rounds: Round[];
  players: Player[];
  courtsCount: number;
  matchLength: number; // in mins
  onGenerateNextRound: () => void;
  onUpdateMatchResult: (roundNum: number, matchId: string, result: Matchup["result"]) => void;
  onRegenerateCurrentRound: () => void;
  onEndRound: () => void;
}

export default function RoundsScreen({
  rounds,
  players,
  courtsCount,
  matchLength,
  onGenerateNextRound,
  onUpdateMatchResult,
  onRegenerateCurrentRound,
  onEndRound,
}: RoundsScreenProps) {
  // We locate the current active round
  const activeRound = rounds.find((r) => !r.isCompleted);
  // Show last completed or active
  const [selectedRoundNum, setSelectedRoundNum] = useState<number | null>(null);

  // Synchronize on rounds array modifications
  useEffect(() => {
    if (activeRound) {
      setSelectedRoundNum(activeRound.roundNumber);
    } else if (rounds.length > 0 && selectedRoundNum === null) {
      setSelectedRoundNum(rounds[rounds.length - 1].roundNumber);
    }
  }, [rounds, activeRound]);

  const currentRound = rounds.find((r) => r.roundNumber === selectedRoundNum) || activeRound || rounds[rounds.length - 1];

  // Helper mapping
  const playerMap = useRef<Record<string, string>>({});
  useEffect(() => {
    const map: Record<string, string> = {};
    for (const p of players) {
      map[p.id] = p.name;
    }
    playerMap.current = map;
  }, [players]);

  const getPlayerName = (id: string) => playerMap.current[id] || id;

  // COUNTDOWN TIMER STATE
  const [timeLeft, setTimeLeft] = useState(matchLength * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync timer when matchLength setting or screen selection changes
  useEffect(() => {
    setTimeLeft(matchLength * 60);
    setIsTimerRunning(false);
  }, [matchLength, currentRound?.roundNumber]);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleStartPause = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(matchLength * 60);
  };

  // REGENERATION CONFIRMATION DIALOG
  const [showConfirmRegen, setShowConfirmRegen] = useState(false);

  const triggerRegenerate = () => {
    // Check if any match in current round has been scored
    const hasScores = currentRound?.matchups.some((m) => m.result !== "pending");
    if (hasScores) {
      setShowConfirmRegen(true);
    } else {
      onRegenerateCurrentRound();
    }
  };

  const confirmRegenerate = () => {
    setShowConfirmRegen(false);
    onRegenerateCurrentRound();
  };

  // CHECK IF ALL RESULTS ENTERED BEFORE NEXT ACTIONS
  const allResultsScored = currentRound?.matchups.every((m) => m.result !== "pending");

  return (
    <div className="flex-1 flex flex-col p-5 space-y-4 bg-slate-50/50">
      {/* Round Selection Tabs */}
      {rounds.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
            Round Selector
          </span>
          <div className="flex gap-1 overflow-x-auto py-1 scrollbar-none max-w-[240px]">
            {rounds.map((r) => (
              <button
                key={r.roundNumber}
                onClick={() => setSelectedRoundNum(r.roundNumber)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedRoundNum === r.roundNumber
                    ? "bg-slate-900 text-white font-bold"
                    : r.isCompleted
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-white text-slate-400 border border-slate-200"
                }`}
              >
                R{r.roundNumber}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Empty State */}
      {rounds.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-4 bg-white border border-dashed border-slate-200 rounded-3xl space-y-4 shadow-sm">
          <div className="p-3 bg-green-50 rounded-full text-green-600 border border-green-100">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Perfect Rotation Rounds</h3>
            <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
              Ready to construct your round rotations? Click the big button below to shuffle courts and resting slots.
            </p>
          </div>
          <button
            onClick={onGenerateNextRound}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer"
          >
            Start Round 1 Rotation
          </button>
        </div>
      ) : (
        <div className="space-y-4 flex-1 flex flex-col">
          {/* COURT ROUND COUNTDOWN CARD - Repurposed to Match mockup */}
          {currentRound && (
            <div className={`p-5 rounded-[24px] border shadow-sm transition-all bg-white ${
              timeLeft === 0 && isTimerRunning === false && !currentRound.isCompleted
                ? "border-rose-300 ring-2 ring-rose-100"
                : "border-slate-100"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-800 text-sm font-bold uppercase tracking-wider">
                      Remaining
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold tracking-tight ${
                      currentRound.isCompleted
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : "bg-amber-50 text-amber-700 border border-amber-100"
                    }`}>
                      {currentRound.isCompleted ? "Completed" : "Round " + currentRound.roundNumber}
                    </span>
                  </div>
                  <p className="text-3xl font-mono font-bold text-slate-800 mt-1">
                    {formatTime(timeLeft)}
                  </p>
                </div>

                {/* COUNTDOWN TILES / CONTROLS (Circle mockup style) */}
                {!currentRound.isCompleted && (
                  <div className="flex items-center gap-2">
                    {/* Reset button */}
                    <button
                      onClick={handleResetTimer}
                      className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 active:scale-90 transition-all cursor-pointer hover:bg-slate-100 hover:text-slate-600"
                      title="Reset Timer"
                    >
                      <RotateCcw className="w-4.5 h-4.5" />
                    </button>
                    {/* Play/Pause primary action */}
                    <button
                      onClick={handleStartPause}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white active:scale-90 transition-all cursor-pointer ${
                        isTimerRunning ? "bg-amber-500 hover:bg-amber-600" : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      {isTimerRunning ? <Pause className="w-4 h-4 fill-current ml-0" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* COURT CARD LISTING */}
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px] pr-1">
            {currentRound?.matchups.map((match) => {
              const pA1 = getPlayerName(match.pairA[0]);
              const pA2 = getPlayerName(match.pairA[1]);
              const pB1 = getPlayerName(match.pairB[0]);
              const pB2 = getPlayerName(match.pairB[1]);

              return (
                <div
                  key={match.id}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3"
                >
                  {/* Title Bar containing Court Number */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-400 uppercase tracking-tighter">
                      Court {match.courtNumber}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      match.result !== "pending"
                        ? "bg-green-50 text-green-700"
                        : "bg-slate-50 text-slate-400"
                    }`}>
                      {match.result !== "pending" ? "Scored" : "Live"}
                    </span>
                  </div>

                  {/* Competitors Row (Mockup Style) */}
                  <div className="flex items-center justify-between gap-2 py-1">
                    <div className="flex-1 text-center min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {pA1} &amp; {pA2}
                      </p>
                    </div>
                    <div className="text-slate-350 font-black italic text-[10px] shrink-0 select-none">
                      VS
                    </div>
                    <div className="flex-1 text-center min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {pB1} &amp; {pB2}
                      </p>
                    </div>
                  </div>

                  {/* Tactical Clean scoring buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-1 select-none">
                    <button
                      type="button"
                      onClick={() => onUpdateMatchResult(currentRound.roundNumber, match.id, "pairA")}
                      className={`py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tight text-center border transition-all cursor-pointer ${
                        match.result === "pairA"
                          ? "bg-green-55/40 bg-green-500 text-white border-green-500"
                          : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100/80 hover:text-slate-650"
                      }`}
                    >
                      A WIN
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateMatchResult(currentRound.roundNumber, match.id, "draw")}
                      className={`py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tight text-center border transition-all cursor-pointer ${
                        match.result === "draw"
                          ? "bg-slate-850 bg-slate-900 text-white border-slate-900"
                          : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100/80 hover:text-slate-655"
                      }`}
                    >
                      DRAW
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateMatchResult(currentRound.roundNumber, match.id, "pairB")}
                      className={`py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tight text-center border transition-all cursor-pointer ${
                        match.result === "pairB"
                          ? "bg-green-55/40 bg-green-500 text-white border-green-500"
                          : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100/80 hover:text-slate-650"
                      }`}
                    >
                      B WIN
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RESTING PLAYERS AREA */}
          {currentRound && currentRound.restingPlayerIds.length > 0 && (
            <div className="bg-slate-200/40 p-4 rounded-2xl border border-slate-100/50">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Resting this round
              </span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {currentRound.restingPlayerIds.map((rid) => (
                  <span
                    key={rid}
                    className="text-xs bg-white text-slate-650 px-3 py-1 rounded-full border border-slate-200/60 font-semibold shadow-sm"
                  >
                    {getPlayerName(rid)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CONFIRM REGENERATE ROUND MODAL OVERLAY (Light Theme) */}
          {showConfirmRegen && (
            <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
                <div className="flex gap-3 text-rose-500 items-start">
                  <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Results Warning</h4>
                    <p className="text-xs text-slate-500 leading-normal mt-1">
                      You have entered match results for this round. Regenerating will scramble pairs and delete those results. Do you want to proceed?
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowConfirmRegen(false)}
                    className="px-3.5 py-2 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRegenerate}
                    className="px-3.5 py-2 rounded-xl text-xs bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
                  >
                    Proceed & Scramble
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE FOOTER ACTIONS */}
          <div className="pt-2 select-none space-y-2">
            {!currentRound.isCompleted ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={triggerRegenerate}
                  className="bg-white border border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm h-12 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-slate-400" />
                  <span>Shuffle Pairs</span>
                </button>
                <button
                  type="button"
                  onClick={onEndRound}
                  disabled={!allResultsScored}
                  className="bg-slate-900 disabled:opacity-40 text-white h-12 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all hover:bg-slate-800 cursor-pointer disabled:pointer-events-none"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Submit Results</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onGenerateNextRound}
                className="w-full bg-slate-900 text-white h-14 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-98 transition-all hover:bg-slate-800 cursor-pointer shadow-md"
              >
                <span>Next Round Preview</span>
                <Play className="w-5 h-5 fill-current" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
