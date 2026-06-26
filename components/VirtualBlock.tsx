"use client";

import { useEffect, useState, useRef, ReactNode } from "react";

interface VirtualBlockProps {
  children: ReactNode;
  fallbackHeight?: number;
}

export default function VirtualBlock({
  children,
  fallbackHeight = 1000,
}: VirtualBlockProps) {
  const [isInView, setIsInView] = useState(false);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        } else {
          // Capture the exact height before unmounting to prevent scroll jumping
          if (containerRef.current) {
            const currentHeight =
              containerRef.current.getBoundingClientRect().height;
            if (currentHeight > 0) {
              setHeight(currentHeight);
            }
          }
          setIsInView(false);
        }
      },
      // Trigger 1500px above and below the viewport so it renders before the user sees it
      { rootMargin: "1500px 0px 1500px 0px" },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ minHeight: height || fallbackHeight }}>
      {isInView ? children : null}
    </div>
  );
}
