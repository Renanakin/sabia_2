"use client";

import HeroMobile from "./home/HeroMobile";
import StatsMobile from "./home/StatsMobile";
import ServicesMobile from "./home/ServicesMobile";
import FeaturesMobile from "./home/FeaturesMobile";
import TestimonialsMobile from "./home/TestimonialsMobile";
import FaqMobile from "./home/FaqMobile";
import CtaMobile from "./home/CtaMobile";

export default function HomeMobile() {
  return (
    <div className="flex flex-col min-h-screen bg-[#032030] text-slate-100 md:hidden">
      <HeroMobile />
      <StatsMobile />
      <ServicesMobile />
      <FeaturesMobile />
      <TestimonialsMobile />
      <FaqMobile />
      <CtaMobile />
    </div>
  );
}
