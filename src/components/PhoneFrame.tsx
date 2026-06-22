/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Battery, Wifi, Signal } from "lucide-react";

interface PhoneFrameProps {
  children: React.ReactNode;
}

export default function PhoneFrame({ children }: PhoneFrameProps) {
  const [timeStr, setTimeStr] = useState("17:00");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
      setTimeStr(`${hours}:${minutesStr}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-0 sm:p-4 md:p-8 antialiased selection:bg-green-500 selection:text-white">
      {/* Background visual padel patterns in desktop view - light dot style */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#10b981_1.5px,transparent_1.5px)] [background-size:24px_24px] hidden sm:block"></div>
      
      {/* Outer mock device: Clean Minimalism with premium slate-900 frame */}
      <div className="relative w-full max-w-[400px] h-screen sm:h-[844px] bg-white sm:rounded-[56px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col border-[10px] border-slate-900">
        
        {/* iOS Status Bar (Visible on desktop and mobile) - Minimal Light Theme */}
        <div className="relative h-12 bg-white text-slate-800 flex items-center justify-between px-6 shrink-0 select-none z-50 border-b border-slate-50/50">
          {/* Time */}
          <span className="text-[14px] font-semibold tracking-tight">{timeStr}</span>
          
          {/* Dynamic Island Notch */}
          <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-24 h-5.5 bg-black rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-zinc-900 rounded-full ml-auto mr-3 border border-zinc-800/20"></div>
          </div>
          
          {/* Icons: Signal, Wifi, Battery */}
          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5 text-slate-800 fill-slate-800" />
            <Wifi className="w-3.5 h-3.5 text-slate-800" />
            <div className="relative flex items-center gap-0.5">
              <span className="text-[10px] font-bold leading-none mr-0.5 text-slate-600">85%</span>
              <Battery className="w-4.5 h-4.5 text-slate-800 fill-slate-800" />
            </div>
          </div>
        </div>

        {/* Dynamic Island interaction badge - Noviun Padel Social (Light Accent) */}
        <div className="bg-green-50/60 border-b border-green-100/40 text-[9px] py-1 text-center text-green-700 font-mono tracking-widest z-40 select-none font-bold">
          🎾 NOVIUN PADEL ARENA 🎾
        </div>

        {/* Application Content Grid - Light minimalist colors */}
        <div className="flex-1 overflow-y-auto bg-slate-50 text-slate-800 flex flex-col relative">
          {children}
        </div>

        {/* iOS Home Indicator Bar - Light mode */}
        <div className="h-4 bg-white flex items-center justify-center shrink-0 select-none pb-1 border-t border-slate-100">
          <div className="w-28 h-1 bg-slate-200 rounded-full"></div>
        </div>

      </div>
    </div>
  );
}
