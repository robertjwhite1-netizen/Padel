/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface PhoneFrameProps {
  children: React.ReactNode;
}

export default function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-0 sm:p-4 md:p-8 antialiased selection:bg-green-500 selection:text-white">
      {/* Background visual padel patterns in desktop view - light dot style */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#10b981_1.5px,transparent_1.5px)] [background-size:24px_24px] hidden sm:block"></div>
      
      {/* Outer mock device: Clean Minimalism with premium slate-900 frame */}
      <div className="relative w-full max-w-[400px] h-screen sm:h-[844px] bg-white sm:rounded-[56px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col border-[10px] border-slate-900">
        
        {/* Dynamic Island interaction badge - Noviun Padel Social (Light Accent) */}
        <div className="bg-green-50/60 border-b border-green-100/40 text-[9px] py-2 text-center text-green-700 font-mono tracking-widest z-40 select-none font-bold">
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
