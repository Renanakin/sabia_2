"use client";

import { useState, useEffect, useRef } from "react";
import { homeStats } from "@/app/data";

function Counter({ endValue, duration = 2000, suffix = "" }: { endValue: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const hasRunRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTimeout(() => setCount(endValue), 0);
      return;
    }

    let rafId: number;
    let fallbackMs: number;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !hasRunRef.current) {
            hasRunRef.current = true;
            observer.disconnect();

            let startTime: number | null = null;
            fallbackMs = window.setTimeout(() => setCount(endValue), duration + 300);

            const step = (timestamp: number) => {
              if (!startTime) startTime = timestamp;
              const progress = Math.min((timestamp - startTime) / duration, 1);
              setCount(Math.floor(progress * endValue));
              if (progress < 1) {
                rafId = window.requestAnimationFrame(step);
              } else {
                setCount(endValue);
              }
            };

            rafId = window.requestAnimationFrame(step);
            break;
          }
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (rafId) window.cancelAnimationFrame(rafId);
      if (fallbackMs) window.clearTimeout(fallbackMs);
    };
  }, [endValue, duration]);

  return (
    <span ref={containerRef} className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
      {count}
      {suffix}
    </span>
  );
}

export default function StatsDesktop() {
  return (
    <section className="bg-[#021824] py-10 sm:py-12 lg:py-14 border-b border-white/5">
      <div className="site-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {homeStats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center space-y-2 p-4">
              <Counter endValue={stat.value} suffix={stat.suffix} />
              <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
