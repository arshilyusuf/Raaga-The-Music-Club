"use client";

import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

export default function SmoothScroller({
  children,
}: {
  children: React.ReactNode;
}) {
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
      // syncTouch: true,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 0.8,
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
