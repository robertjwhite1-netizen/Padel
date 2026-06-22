/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface EventSetup {
  eventName: string;
  startTime: string;
  endTime: string;
  courtsCount: number;
  matchLength: number; // in minutes
  winPoints: number;
  drawPoints: number;
  lossPoints: number;
}

export interface Player {
  id: string;
  name: string;
  isAvailable: boolean; // can temporarily sit out
}

export interface PlayerStats {
  playerId: string;
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  rests: number;
  points: number;
}

export interface Matchup {
  id: string;
  courtNumber: number;
  // Each pair is an array of 2 Player IDs
  pairA: [string, string];
  pairB: [string, string];
  result: "pending" | "pairA" | "draw" | "pairB";
}

export interface Round {
  roundNumber: number;
  matchups: Matchup[];
  restingPlayerIds: string[];
  isCompleted: boolean;
}

export interface SemiFinals {
  semi1: {
    id: string;
    pairA: [string, string]; // Rank 1 and 8
    pairB: [string, string]; // Rank 4 and 5
    result: "pending" | "pairA" | "pairB";
    courtNumber: number;
  };
  semi2: {
    id: string;
    pairA: [string, string]; // Rank 2 and 7
    pairB: [string, string]; // Rank 3 and 6
    result: "pending" | "pairA" | "pairB";
    courtNumber: number;
  };
  isCompleted: boolean;
}

export interface Finals {
  id: string;
  pairA: [string, string]; // Winners of semi1
  pairB: [string, string]; // Winners of semi2
  result: "pending" | "pairA" | "pairB";
  courtNumber: number;
  isCompleted: boolean;
}

export type AppTab = "setup" | "players" | "rounds" | "leaderboard" | "brackets" | "winners";
