/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AppTab } from "../types";
import { Clock, Users, Play, BarChart3, Binary, Trophy } from "lucide-react";

interface ScheduleTimelineProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  hasRounds: boolean;
  hasSemifinals: boolean;
  hasFinals: boolean;
}

export default function ScheduleTimeline({
  currentTab,
  onTabChange,
  hasRounds,
  hasSemifinals,
  hasFinals,
}: ScheduleTimelineProps) {
  const scheduleItems = [
    {
      tab: "setup" as AppTab,
      label: "Setup",
      time: "5:00 - 5:10 PM",
      icon: Clock,
      desc: "Event details",
      enabled: true,
    },
    {
      tab: "players" as AppTab,
      label: "Players",
      time: "5:10 - 5:15 PM",
      icon: Users,
      desc: "Manage & sitting out",
      enabled: true,
    },
    {
      tab: "rounds" as AppTab,
      label: "Rounds",
      time: "5:10 - 6:15 PM",
      icon: Play,
      desc: "Play & enter scores",
      enabled: true, // can always visit
    },
    {
      tab: "leaderboard" as AppTab,
      label: "Leaderboard",
      time: "6:15 - 6:25 PM",
      icon: BarChart3,
      desc: "Live rankings & edits",
      enabled: true,
    },
    {
      tab: "brackets" as AppTab,
      label: "Finals",
      time: "6:25 - 6:55 PM",
      icon: Binary,
      desc: "Semi-finals & Final",
      enabled: true, // can preview or start
    },
    {
      tab: "winners" as AppTab,
      label: "Winners",
      time: "6:55 - 7:00 PM",
      icon: Trophy,
      desc: "Champions & share",
      enabled: true,
    },
  ];

  return (
    <div className="bg-white py-2 border-b border-slate-100 px-4 inline-flex w-full overflow-x-auto gap-3 scrollbar-none select-none shrink-0 scroll-smooth">
      {scheduleItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.tab;

        return (
          <button
            key={item.tab}
            onClick={() => onTabChange(item.tab)}
            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition-all duration-300 text-left cursor-pointer border shrink-0 ${
              isActive
                ? "bg-slate-900 text-white border-slate-900 font-bold shadow-sm scale-102"
                : "bg-slate-50 text-slate-500 border-slate-100 hover:text-slate-850 hover:border-slate-200"
            }`}
          >
            <div
              className={`p-1.5 rounded-lg shrink-0 ${
                isActive ? "bg-white/10 text-white" : "bg-white text-slate-850 shadow-sm border border-slate-100"
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[12px] font-bold leading-none uppercase tracking-tight">
                {item.label}
              </div>
              <div
                className={`text-[9px] font-medium mt-0.5 leading-none ${
                  isActive ? "text-slate-300" : "text-slate-400"
                }`}
              >
                {item.time}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
