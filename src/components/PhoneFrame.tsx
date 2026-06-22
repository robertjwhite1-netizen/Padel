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
    <div className="min-h-screen bg-white flex flex-col items-center justify-start antialiased selection:bg-green-500 selection:text-white">
      {/* Clean minimalist responsive container on a pure white background */}
      <div className="w-full max-w-md bg-white flex flex-col min-h-screen shadow-sm border-x border-slate-100">
        
        {/* Simple elegant venue subtitle bar */}
        <div className="bg-slate-50/50 text-[10px] py-2 text-center text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 select-none">
          🎾 Noviun Padel Arena 🎾
        </div>

        {/* Application Content Grid */}
        <div className="flex-1 flex flex-col relative bg-white">
          {children}
        </div>

      </div>
    </div>
  );
}

