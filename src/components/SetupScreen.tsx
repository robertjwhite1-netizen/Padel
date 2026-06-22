/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EventSetup } from "../types";
import { Settings, Calendar, Award, Check } from "lucide-react";

interface SetupScreenProps {
  setup: EventSetup;
  onChange: (newSetup: EventSetup) => void;
  onNext: () => void;
}

export default function SetupScreen({ setup, onChange, onNext }: SetupScreenProps) {
  const handleFieldChange = (key: keyof EventSetup, val: any) => {
    onChange({
      ...setup,
      [key]: val,
    });
  };

  return (
    <div className="flex-1 flex flex-col p-5 space-y-6 bg-slate-50/50">
      {/* Visual Welcome Banner - Clean Minimalism Light style */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-5 text-slate-800 border border-slate-150 shadow-sm">
        <div className="absolute right-0 bottom-0 translate-y-1/4 translate-x-1/4 opacity-5">
          <Calendar className="w-52 h-52 text-slate-900" />
        </div>
        <div className="relative z-10">
          <span className="text-[10px] uppercase font-bold tracking-wider bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-full italic">
            Padel Event Planner
          </span>
          <h2 className="text-lg font-bold mt-2.5 leading-none tracking-tight text-slate-900">
            Noviun Padel Social
          </h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">
            Run a lively double-pairing padel social in seconds. We balance play cycles, track individual points, create live leaderboards, and auto-generate finals.
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Event Name */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1.5">
            Event Name
          </label>
          <input
            type="text"
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-semibold focus:outline-none focus:border-green-500 transition-colors shadow-sm"
            value={setup.eventName}
            onChange={(e) => handleFieldChange("eventName", e.target.value)}
            placeholder="Noviun Padel Social"
          />
        </div>

        {/* Time bounds */}
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1.5">
              Start Time
            </label>
            <input
              type="text"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-semibold focus:outline-none focus:border-green-500 transition-colors text-center shadow-sm"
              value={setup.startTime}
              onChange={(e) => handleFieldChange("startTime", e.target.value)}
              placeholder="5:00pm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1.5">
              End Time
            </label>
            <input
              type="text"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-semibold focus:outline-none focus:border-green-500 transition-colors text-center shadow-sm"
              value={setup.endTime}
              onChange={(e) => handleFieldChange("endTime", e.target.value)}
              placeholder="7:00pm"
            />
          </div>
        </div>

        {/* Court configuration */}
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1.5">
              Active Courts
            </label>
            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2 shadow-sm">
              <button
                type="button"
                onClick={() => handleFieldChange("courtsCount", Math.max(1, setup.courtsCount - 1))}
                className="w-8 h-8 rounded-lg text-slate-400 active:text-slate-800 font-black text-lg select-none cursor-pointer"
              >
                -
              </button>
              <span className="flex-1 text-center font-bold text-slate-800 text-sm select-none">
                {setup.courtsCount}
              </span>
              <button
                type="button"
                onClick={() => handleFieldChange("courtsCount", Math.min(10, setup.courtsCount + 1))}
                className="w-8 h-8 rounded-lg text-slate-400 active:text-slate-800 font-black text-lg select-none cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1.5">
              Match Length
            </label>
            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2 shadow-sm">
              <button
                type="button"
                onClick={() => handleFieldChange("matchLength", Math.max(5, setup.matchLength - 5))}
                className="w-8 h-8 rounded-lg text-slate-400 active:text-slate-800 font-black text-lg select-none cursor-pointer"
              >
                -
              </button>
              <span className="flex-1 text-center font-bold text-slate-800 text-sm select-none">
                {setup.matchLength} min
              </span>
              <button
                type="button"
                onClick={() => handleFieldChange("matchLength", Math.min(60, setup.matchLength + 5))}
                className="w-8 h-8 rounded-lg text-slate-400 active:text-slate-800 font-black text-lg select-none cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic score weights */}
        <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm space-y-3">
          <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs uppercase tracking-tighter">
            <Award className="w-4 h-4 text-green-600" />
            <span>Social Points Engine Weights</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Win</span>
              <input
                type="number"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 text-center text-slate-800 text-xs font-bold"
                value={setup.winPoints}
                onChange={(e) => handleFieldChange("winPoints", parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Draw</span>
              <input
                type="number"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 text-center text-slate-800 text-xs font-bold"
                value={setup.drawPoints}
                onChange={(e) => handleFieldChange("drawPoints", parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Loss</span>
              <input
                type="number"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 text-center text-slate-800 text-xs font-bold"
                value={setup.lossPoints}
                onChange={(e) => handleFieldChange("lossPoints", parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Touch Action Button */}
      <div className="pt-2">
        <button
          onClick={onNext}
          type="button"
          className="w-full bg-slate-900 text-white h-14 rounded-2xl font-bold text-base shadow-md hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue to Player List</span>
          <Check className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
