/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { EventSetup, Player, Round, SemiFinals, Finals, AppTab, PlayerStats } from "./types";
import { DEFAULT_PLAYERS } from "./data/defaultPlayers";
import { generateNextRound } from "./utils/pairing";

// Component imports
import PhoneFrame from "./components/PhoneFrame";
import Header from "./components/Header";
import ScheduleTimeline from "./components/ScheduleTimeline";
import SetupScreen from "./components/SetupScreen";
import PlayersScreen from "./components/PlayersScreen";
import RoundsScreen from "./components/RoundsScreen";
import LeaderboardScreen from "./components/LeaderboardScreen";
import BracketsScreen from "./components/BracketsScreen";
import WinnersScreen from "./components/WinnersScreen";

const STORAGE_KEYS = {
  setup: "noviun_padel_setup_r1",
  players: "noviun_padel_players_r1",
  rounds: "noviun_padel_rounds_r1",
  semiFinals: "noviun_padel_semis_r1",
  finals: "noviun_padel_finals_r1",
  winningPair: "noviun_padel_winners_r1",
  tab: "noviun_padel_active_tab_r1",
  manualStats: "noviun_padel_manual_stats_r1",
};

const DEFAULT_SETUP: EventSetup = {
  eventName: "Noviun Padel Social",
  startTime: "5:00pm",
  endTime: "7:00pm",
  courtsCount: 4,
  matchLength: 10,
  winPoints: 3,
  drawPoints: 1,
  lossPoints: 0,
};

export default function App() {
  // ----------------------------------------------------
  // INITIALIZERS WITH PERSISTENT STORAGE
  // ----------------------------------------------------
  const [setup, setSetup] = useState<EventSetup>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.setup);
      return saved ? JSON.parse(saved) : DEFAULT_SETUP;
    } catch {
      return DEFAULT_SETUP;
    }
  });

  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.players);
      return saved ? JSON.parse(saved) : DEFAULT_PLAYERS;
    } catch {
      return DEFAULT_PLAYERS;
    }
  });

  const [rounds, setRounds] = useState<Round[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.rounds);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [semiFinals, setSemiFinals] = useState<SemiFinals | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.semiFinals);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [finals, setFinals] = useState<Finals | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.finals);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [winningPair, setWinningPair] = useState<[string, string] | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.winningPair);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentTab, setCurrentTab] = useState<AppTab>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.tab);
      return saved ? (saved as AppTab) : "setup";
    } catch {
      return "setup";
    }
  });

  const [manualStats, setManualStats] = useState<Record<string, PlayerStats>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.manualStats);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // ----------------------------------------------------
  // AUTOSAVE REACTION PIPELINE
  // ----------------------------------------------------
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.setup, JSON.stringify(setup));
    } catch {}
  }, [setup]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.players, JSON.stringify(players));
    } catch {}
  }, [players]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.rounds, JSON.stringify(rounds));
    } catch {}
  }, [rounds]);

  useEffect(() => {
    try {
      if (semiFinals) {
        localStorage.setItem(STORAGE_KEYS.semiFinals, JSON.stringify(semiFinals));
      } else {
        localStorage.removeItem(STORAGE_KEYS.semiFinals);
      }
    } catch {}
  }, [semiFinals]);

  useEffect(() => {
    try {
      if (finals) {
        localStorage.setItem(STORAGE_KEYS.finals, JSON.stringify(finals));
      } else {
        localStorage.removeItem(STORAGE_KEYS.finals);
      }
    } catch {}
  }, [finals]);

  useEffect(() => {
    try {
      if (winningPair) {
        localStorage.setItem(STORAGE_KEYS.winningPair, JSON.stringify(winningPair));
      } else {
        localStorage.removeItem(STORAGE_KEYS.winningPair);
      }
    } catch {}
  }, [winningPair]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.tab, currentTab);
    } catch {}
  }, [currentTab]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.manualStats, JSON.stringify(manualStats));
    } catch {}
  }, [manualStats]);

  // ----------------------------------------------------
  // ROSTER MUTATION WORKFLOWS
  // ----------------------------------------------------
  const handleAddPlayer = (name: string) => {
    const fresh: Player = {
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name,
      isAvailable: true,
    };
    setPlayers((prev) => [...prev, fresh]);
  };

  const handleUpdatePlayer = (id: string, updates: Partial<Player>) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const handleDeletePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const handleShufflePlayers = () => {
    setPlayers((prev) => {
      const cloned = [...prev];
      for (let i = cloned.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
      }
      return cloned;
    });
  };

  // ----------------------------------------------------
  // ROTATION ROUND TRACKER WORKFLOWS
  // ----------------------------------------------------
  const handleGenerateNextRound = () => {
    const nextRoundNumber = rounds.length + 1;
    const freshRound = generateNextRound(players, rounds, setup.courtsCount, nextRoundNumber);
    setRounds((prev) => [...prev, freshRound]);
    setCurrentTab("rounds");
  };

  // Record individual score button tap
  const handleUpdateMatchResult = (roundNum: number, matchId: string, result: Round["matchups"][0]["result"]) => {
    setRounds((prev) =>
      prev.map((r) => {
        if (r.roundNumber === roundNum) {
          return {
            ...r,
            matchups: r.matchups.map((m) => (m.id === matchId ? { ...m, result } : m)),
          };
        }
        return r;
      })
    );
  };

  const handleRegenerateCurrentRound = () => {
    if (rounds.length === 0) return;
    const currentNum = rounds.length;
    // previous rounds does not include the last one being regenerated
    const previous = rounds.slice(0, currentNum - 1);
    const scrambled = generateNextRound(players, previous, setup.courtsCount, currentNum);

    setRounds((prev) => prev.map((r, idx) => (idx === prev.length - 1 ? scrambled : r)));
  };

  const handleEndRound = () => {
    setRounds((prev) =>
      prev.map((r, idx) => (idx === prev.length - 1 ? { ...r, isCompleted: true } : r))
    );
    // Automatically direct to leaderboard to see high scores
    setCurrentTab("leaderboard");
  };

  // ----------------------------------------------------
  // OVERRIDES & CLEAN PURGE TRIGGER
  // ----------------------------------------------------
  const handleUpdateManualStats = (playerId: string, updatedStats: PlayerStats) => {
    setManualStats((prev) => ({
      ...prev,
      [playerId]: updatedStats,
    }));
  };

  const handleResetEvent = () => {
    // Purge everything
    setSetup(DEFAULT_SETUP);
    setPlayers(DEFAULT_PLAYERS);
    setRounds([]);
    setSemiFinals(null);
    setFinals(null);
    setWinningPair(null);
    setManualStats({});
    setCurrentTab("setup");
    try {
      localStorage.clear();
    } catch {}
  };

  // Setup tab title text matching
  const getTabTitle = () => {
    switch (currentTab) {
      case "setup":
        return "Setup Event";
      case "players":
        return "Player Roster";
      case "rounds":
        return `Rotate Courts`;
      case "leaderboard":
        return "Standings Live";
      case "brackets":
        return "Final Brackets";
      case "winners":
        return "Champions Podium";
      default:
        return "Noviun Padel";
    }
  };

  return (
    <PhoneFrame>
      {/* Universal header layout */}
      <Header
        title="Noviun Padel"
        subtitle={getTabTitle()}
        statusText={setup.eventName || "Social Event"}
      />

      {/* Persistent schedule tracker containing timeline links */}
      <ScheduleTimeline
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        hasRounds={rounds.length > 0}
        hasSemifinals={!!semiFinals}
        hasFinals={!!finals}
      />

      {/* Render selected screen accordingly */}
      {currentTab === "setup" && (
        <SetupScreen
          setup={setup}
          onChange={(newSetup) => setSetup(newSetup)}
          onNext={() => setCurrentTab("players")}
        />
      )}

      {currentTab === "players" && (
        <PlayersScreen
          players={players}
          courtsCount={setup.courtsCount}
          onAddPlayer={handleAddPlayer}
          onUpdatePlayer={handleUpdatePlayer}
          onDeletePlayer={handleDeletePlayer}
          onShufflePlayers={handleShufflePlayers}
          onNext={() => {
            // Generate next round automatically on first arrival if none exists!
            if (rounds.length === 0) {
              handleGenerateNextRound();
            } else {
              setCurrentTab("rounds");
            }
          }}
        />
      )}

      {currentTab === "rounds" && (
        <RoundsScreen
          rounds={rounds}
          players={players}
          courtsCount={setup.courtsCount}
          matchLength={setup.matchLength}
          onGenerateNextRound={handleGenerateNextRound}
          onUpdateMatchResult={handleUpdateMatchResult}
          onRegenerateCurrentRound={handleRegenerateCurrentRound}
          onEndRound={handleEndRound}
        />
      )}

      {currentTab === "leaderboard" && (
        <LeaderboardScreen
          players={players}
          rounds={rounds}
          winPoints={setup.winPoints}
          drawPoints={setup.drawPoints}
          lossPoints={setup.lossPoints}
          onUpdateManualStats={handleUpdateManualStats}
          onNext={() => setCurrentTab("brackets")}
        />
      )}

      {currentTab === "brackets" && (
        <BracketsScreen
          players={players}
          rounds={rounds}
          semiFinals={semiFinals}
          finals={finals}
          winPoints={setup.winPoints}
          drawPoints={setup.drawPoints}
          lossPoints={setup.lossPoints}
          onUpdateSemiFinals={(sf) => setSemiFinals(sf)}
          onUpdateFinals={(fi) => setFinals(fi)}
          onCompletePlayoffs={(wp) => setWinningPair(wp)}
          onGoToTab={(tab) => setCurrentTab(tab)}
        />
      )}

      {currentTab === "winners" && (
        <WinnersScreen
          players={players}
          rounds={rounds}
          winningPair={winningPair}
          winPoints={setup.winPoints}
          drawPoints={setup.drawPoints}
          lossPoints={setup.lossPoints}
          onResetEvent={handleResetEvent}
        />
      )}
    </PhoneFrame>
  );
}
