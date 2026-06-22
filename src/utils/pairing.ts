/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, Round, Matchup, PlayerStats } from "../types";

/**
 * Calculates current tournament stats for each player based on past rounds.
 * This is used to compute weights for fair rotation of play and rests.
 */
export function getHistoricalStats(players: Player[], previousRounds: Round[]) {
  const statsMap: Record<string, { gamesPlayed: number; rests: number; partners: Record<string, number>; opponents: Record<string, number> }> = {};

  // Initialize stats map
  for (const p of players) {
    statsMap[p.id] = {
      gamesPlayed: 0,
      rests: 0,
      partners: {},
      opponents: {},
    };
  }

  // Populate from previous rounds
  for (const round of previousRounds) {
    // Resting players
    for (const rid of round.restingPlayerIds) {
      if (statsMap[rid]) {
        statsMap[rid].rests += 1;
      }
    }

    // Active matchups
    for (const match of round.matchups) {
      const a1 = match.pairA[0];
      const a2 = match.pairA[1];
      const b1 = match.pairB[0];
      const b2 = match.pairB[1];

      const allFour = [a1, a2, b1, b2];
      for (const pId of allFour) {
        if (statsMap[pId]) {
          statsMap[pId].gamesPlayed += 1;
        }
      }

      const incrementMap = (p: string, other: string, targetMapObj: Record<string, number>) => {
        targetMapObj[other] = (targetMapObj[other] || 0) + 1;
      };

      // Partnerships
      if (statsMap[a1]) incrementMap(a1, a2, statsMap[a1].partners);
      if (statsMap[a2]) incrementMap(a2, a1, statsMap[a2].partners);
      if (statsMap[b1]) incrementMap(b1, b2, statsMap[b1].partners);
      if (statsMap[b2]) incrementMap(b2, b1, statsMap[b2].partners);

      // Opponents
      const teamA = [a1, a2];
      const teamB = [b1, b2];
      for (const ta of teamA) {
        for (const tb of teamB) {
          if (statsMap[ta]) incrementMap(ta, tb, statsMap[ta].opponents);
          if (statsMap[tb]) incrementMap(tb, ta, statsMap[tb].opponents);
        }
      }
    }
  }

  return statsMap;
}

/**
 * Generates matches for a new round given active players & maximum courts.
 */
export function generateNextRound(
  allPlayers: Player[],
  previousRounds: Round[],
  courtsCount: number,
  roundNumber: number
): Round {
  // Only use active players
  const activePlayers = allPlayers.filter((p) => p.isAvailable);

  const statsMap = getHistoricalStats(allPlayers, previousRounds);

  // 1. Determine how many courts we can fill
  // Each court requires exactly 4 players.
  const maxFeasibleCourts = Math.floor(activePlayers.length / 4);
  const actualCourts = Math.min(courtsCount, maxFeasibleCourts);
  const totalPlayersToPlay = actualCourts * 4;

  if (totalPlayersToPlay === 0) {
    // Not enough players to even play 1 court
    return {
      roundNumber,
      matchups: [],
      restingPlayerIds: activePlayers.map((p) => p.id),
      isCompleted: false,
    };
  }

  // 2. Select who plays and who rests
  // We sort active players by priority:
  // - High rest count first (deserves to play)
  // - Low game count first (deserves to play)
  // - Add a small random noise so tie-breaker isn't rigid
  const sortedPlayersWithWeights = activePlayers.map((p) => {
    const stats = statsMap[p.id] || { gamesPlayed: 0, rests: 0 };
    // Higher score = greater priority to PLAY
    // Resting should be minimized, games played as well.
    const score = (stats.rests * 1000) - (stats.gamesPlayed * 100) + Math.random() * 5;
    return { player: p, score };
  });

  // Sort descending by priority to play
  sortedPlayersWithWeights.sort((a, b) => b.score - a.score);

  const playingPlayersList = sortedPlayersWithWeights.slice(0, totalPlayersToPlay).map((pw) => pw.player);
  const restingPlayersList = sortedPlayersWithWeights.slice(totalPlayersToPlay).map((pw) => pw.player);

  const playingIds = playingPlayersList.map((p) => p.id);
  const restingPlayerIds = restingPlayersList.map((p) => p.id);

  // 3. Find the best doubles pairings across the courts to avoid repeating partners and opponents.
  // We use Monte Carlo simulations (500 candidate shuffles) and choose the best one.
  let bestMatchups: Matchup[] = [];
  let minPenalty = Infinity;

  const candidateRunsCount = 500;

  for (let attempt = 0; attempt < candidateRunsCount; attempt++) {
    // Shuffle the playing players array
    const shuffled = [...playingIds];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const currentMatchups: Matchup[] = [];
    let currentPenalty = 0;

    // Group into courts of 4 players
    for (let c = 0; c < actualCourts; c++) {
      const offset = c * 4;
      const p1 = shuffled[offset];
      const p2 = shuffled[offset + 1];
      const p3 = shuffled[offset + 2];
      const p4 = shuffled[offset + 3];

      const pairA: [string, string] = [p1, p2];
      const pairB: [string, string] = [p3, p4];

      // Calculate pairings penalty
      const partnerStats1 = statsMap[p1]?.partners || {};
      const partnerStats2 = statsMap[p2]?.partners || {};
      const partnerStats3 = statsMap[p3]?.partners || {};
      const partnerStats4 = statsMap[p4]?.partners || {};

      const repeatedPartnersA = partnerStats1[p2] || 0;
      const repeatedPartnersB = partnerStats3[p4] || 0;
      // High penalty (500) for repeating a partner
      currentPenalty += (repeatedPartnersA * 500) + (repeatedPartnersB * 500);

      // Calculate opponent penalty
      const opponentStats1 = statsMap[p1]?.opponents || {};
      const opponentStats2 = statsMap[p2]?.opponents || {};

      // Adversaries are: p1-p3, p1-p4, p2-p3, p2-p4
      const p1p3 = opponentStats1[p3] || 0;
      const p1p4 = opponentStats1[p4] || 0;
      const p2p3 = opponentStats2[p3] || 0;
      const p2p4 = opponentStats2[p4] || 0;

      // Medium penalty (50) for facing same opponents again
      currentPenalty += (p1p3 + p1p4 + p2p3 + p2p4) * 50;

      currentMatchups.push({
        id: `r${roundNumber}-c${c + 1}`,
        courtNumber: c + 1,
        pairA,
        pairB,
        result: "pending",
      });
    }

    if (currentPenalty < minPenalty) {
      minPenalty = currentPenalty;
      bestMatchups = currentMatchups;
    }

    if (minPenalty === 0) {
      // Perfect set found, break early
      break;
    }
  }

  return {
    roundNumber,
    matchups: bestMatchups,
    restingPlayerIds,
    isCompleted: false,
  };
}

/**
 * Computes live tournament leaderboard stats based on standard rules:
 * - Win = Win points (default 3)
 * - Draw = Draw points (default 1)
 * - Loss = Loss points (default 0)
 * Sorts according to tiebreakers:
 * 1. Total points
 * 2. Number of wins
 * 3. Fewest losses
 * 4. Games played
 * 5. Random tie-break
 */
export function computeLeaderboard(
  allPlayers: Player[],
  rounds: Round[],
  winPoints = 3,
  drawPoints = 1,
  lossPoints = 0
): { rank: number; player: Player; stats: PlayerStats }[] {
  // Initialize map
  const statsMap: Record<string, PlayerStats> = {};
  for (const p of allPlayers) {
    statsMap[p.id] = {
      playerId: p.id,
      gamesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      rests: 0,
      points: 0,
    };
  }

  // Accumulate results
  for (const r of rounds) {
    // Resting list
    for (const rid of r.restingPlayerIds) {
      if (statsMap[rid]) {
        statsMap[rid].rests += 1;
      }
    }

    // Matchups
    for (const match of r.matchups) {
      const a1 = match.pairA[0];
      const a2 = match.pairA[1];
      const b1 = match.pairB[0];
      const b2 = match.pairB[1];

      // Mark games played for participants
      const participants = [a1, a2, b1, b2];
      for (const pid of participants) {
        if (statsMap[pid]) {
          statsMap[pid].gamesPlayed += 1;
        }
      }

      if (match.result === "pairA") {
        statsMap[a1].wins += 1;
        statsMap[a1].points += winPoints;
        statsMap[a2].wins += 1;
        statsMap[a2].points += winPoints;

        statsMap[b1].losses += 1;
        statsMap[b1].points += lossPoints;
        statsMap[b2].losses += 1;
        statsMap[b2].points += lossPoints;
      } else if (match.result === "pairB") {
        statsMap[b1].wins += 1;
        statsMap[b1].points += winPoints;
        statsMap[b2].wins += 1;
        statsMap[b2].points += winPoints;

        statsMap[a1].losses += 1;
        statsMap[a1].points += lossPoints;
        statsMap[a2].losses += 1;
        statsMap[a2].points += lossPoints;
      } else if (match.result === "draw") {
        statsMap[a1].draws += 1;
        statsMap[a1].points += drawPoints;
        statsMap[a2].draws += 1;
        statsMap[a2].points += drawPoints;
        statsMap[b1].draws += 1;
        statsMap[b1].points += drawPoints;
        statsMap[b2].draws += 1;
        statsMap[b2].points += drawPoints;
      }
    }
  }

  // Convert to sorted team
  const list = allPlayers.map((p) => {
    return {
      player: p,
      stats: statsMap[p.id],
    };
  });

  // Unique deterministic hash helper to prevent flickering tie-breaks
  const getStringHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  list.sort((a, b) => {
    // 1. Total points
    const pDiff = b.stats.points - a.stats.points;
    if (pDiff !== 0) return pDiff;

    // 2. Number of wins
    const wDiff = b.stats.wins - a.stats.wins;
    if (wDiff !== 0) return wDiff;

    // 3. Fewest losses
    const lDiff = a.stats.losses - b.stats.losses;
    if (lDiff !== 0) return lDiff;

    // 4. Games played (or more games played?)
    // Prompt says: "Leaderboard sorting: 1. Total points, 2. Wins, 3. Fewest losses, 4. Games played, 5. Random/hash tie-break"
    const gDiff = b.stats.gamesPlayed - a.stats.gamesPlayed;
    if (gDiff !== 0) return gDiff;

    // 5. Hash / deterministic tie-break based on id/name to keep sorting stable while satisfying request
    return getStringHash(a.player.name) - getStringHash(b.player.name);
  });

  // Calculate ranks handling equal values if necessary, but here we rank strictly based on sorted index
  return list.map((item, idx) => ({
    rank: idx + 1,
    player: item.player,
    stats: item.stats,
  }));
}
