"use client";

import * as Icons from "lucide-react";
import { homeFeatures } from "@/app/data";

export default function FeaturesMobile() {
  return (
    <section className="bg-[#032D42] py-16 px-5 border-y border-white/5">
      <h2 className="text-2xl font-extrabold text-white mb-8">¿Por qué <span className="text-[#E30080]">Sabia Contable</span>?</h2>
      <div className="grid grid-cols-1 gap-5">
        {homeFeatures.map((feature, idx) => {
          // @ts-expect-error - Icons are typed dynamically
          const Icon = Icons[feature.iconName] || Icons.HelpCircle;
          return (
            <div key={idx} className="bg-[#0E273B] p-6 rounded-xl border border-white/5 flex flex-col gap-4">
              <div className="p-3 rounded-lg bg-[#E30080]/10 text-[#E30080] w-fit">
                <Icon size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white text-base mb-2">{feature.title}</h4>
                <p className="text-sm text-slate-400">{feature.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
