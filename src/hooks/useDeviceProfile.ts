"use client";

import { useState, useEffect } from "react";

export function useDeviceProfile() {
  // Default to mobile for mobile-first approach
  const [isMobile, setIsMobile] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => setIsMounted(true), 0);
    
    const checkIsMobile = () => {
      // 768px es el breakpoint 'md' de Tailwind CSS
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    
    // Escuchar cambios de tamaño
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return { isMobile, isDesktop: !isMobile, isMounted };
}
