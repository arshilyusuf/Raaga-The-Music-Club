"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
interface SmoothScrollerProps {
  children: React.ReactNode;
}
export default function SmoothScroller({
  children,
}: SmoothScrollerProps) {
  const pathname = usePathname();
  const enableOnMobile = pathname === "/gallery";
  useEffect(() => {
    // Grab your custom scroll container
    const scrollContainer = document.getElementById("scroll-container");
    if (!scrollContainer) return;

    const lenis = new Lenis({
      wrapper: scrollContainer, // The div that has overflow-y-auto
      content: scrollContainer.firstElementChild as HTMLElement, // The div inside it that holds the content
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      syncTouch: enableOnMobile,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 0.6,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
