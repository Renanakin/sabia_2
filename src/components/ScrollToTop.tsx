"use client";

import React, { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Subir arriba"
      className="fixed bottom-24 right-6 md:bottom-28 md:right-10 z-50 flex items-center justify-center w-12 h-12 bg-[#0b2545]/80 backdrop-blur border border-white/10 text-white rounded-full shadow-lg hover:bg-[#E30080] transition-colors duration-300 animate-in fade-in zoom-in"
    >
      <ChevronUp size={24} />
    </button>
  );
}
