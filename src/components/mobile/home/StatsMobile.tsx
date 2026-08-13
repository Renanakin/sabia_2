"use client";

import { homeStats } from "@/app/data";

export default function StatsMobile() {
  return (
    <section className="bg-[#021824] py-10 border-b border-white/5 px-4">
      <div className="grid grid-cols-3 gap-2 text-center">
        {homeStats.map((stat, i) => (
          <div key={i} className="flex flex-col items-center space-y-2">
            <span className="text-3xl font-extrabold text-white">{stat.stringValue}</span>
            <span className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
