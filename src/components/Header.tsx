/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Award, ShieldAlert, Trophy } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  statusText?: string;
}

export default function Header({ title, subtitle, statusText }: HeaderProps) {
  return (
    <div className="bg-white px-5 py-4 border-b border-slate-100 shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            N
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-800">{title}</h1>
            {subtitle && <p className="text-xs text-slate-400 font-medium">{subtitle}</p>}
          </div>
        </div>
        {statusText && (
          <span className="text-[10px] font-bold tracking-tight bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-100">
            {statusText}
          </span>
        )}
      </div>
    </div>
  );
}
