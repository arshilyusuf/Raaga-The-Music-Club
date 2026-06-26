"use client";

import { useEffect, useRef, useState } from "react";
import { getOptimizedUrl, getPlaceholderUrl } from "@/lib/cloudinary";

interface LazyImageProps {
  src: string;
  alt?: string;
  height?: number;
  className?: string;
  maxWidth?: number;
  onClick?: (src: string) => void;
}

export default function LazyImage({
  src,
  alt = "",
  height,
  className = "",
  maxWidth = 800,
  onClick,
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const placeholderSrc = getPlaceholderUrl(src);
  const optimizedSrc = getOptimizedUrl(src, maxWidth);

  // Intersection Observer: only start loading when near viewport
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px", // start loading 200px before it enters view
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={height ? { height } : undefined}
      onClick={() => onClick?.(src)}
    >
      {/* Placeholder: always rendered, tiny blurred image from Cloudinary */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={placeholderSrc}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover scale-110"
        style={{
          filter: "blur(12px)",
          transition: "opacity 0.4s ease",
          opacity: isLoaded ? 0 : 1,
        }}
      />

      {/* Real image: only mounted once IntersectionObserver fires */}
      {isInView && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={optimizedSrc}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transition: "opacity 0.4s ease",
            opacity: isLoaded ? 1 : 0,
          }}
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </div>
  );
}
