"use client";

import HeroDesktop from "./home/HeroDesktop";
import StatsDesktop from "./home/StatsDesktop";
import ServicesDesktop from "./home/ServicesDesktop";
import FeaturesDesktop from "./home/FeaturesDesktop";
import TestimonialsDesktop from "./home/TestimonialsDesktop";
import FaqDesktop from "./home/FaqDesktop";
import CtaDesktop from "./home/CtaDesktop";

export default function HomeDesktop() {
  return (
    <div className="hidden md:flex flex-col min-h-screen bg-[#032030] text-slate-100">
      <HeroDesktop />
      <StatsDesktop />
      <ServicesDesktop />
      <FeaturesDesktop />
      <TestimonialsDesktop />
      <FaqDesktop />
      <CtaDesktop />
    </div>
  );
}
