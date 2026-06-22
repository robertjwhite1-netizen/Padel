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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 antialiased selection:bg-green-500 selection:text-white my-auto">
      {/* Background visual padel patterns in desktop view - light dot style */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#10b981_1.5px,transparent_1.5px)] [background-size:24px_24px] hidden sm:block"></div>
      
      {/* Outer mock device: Clean Minimalism representing iPhone 15 exact layout aspect */}
      <div className="relative w-[393px] h-[852px] bg-white rounded-[56px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col border-[12px] border-slate-900 shrink-0 z-10">
        
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

      {/* Screen Specs Info - Clean Minimalist display statistics under the mockup */}
      <div className="mt-4 text-center select-none z-10 max-w-[393px]">
        <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
          iPhone 15 Display Replica
        </p>
        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
          6.1" Super Retina XDR OLED • 2556 x 1179 Resolution (460 ppi)
        </p>
      </div>
    </div>
  );
}
