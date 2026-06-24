import React, { useState, useEffect } from "react";
import Strands from "@/Reactbits/Strands";

export interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export default function LoadingOverlay({
  isLoading,
  message,
}: LoadingOverlayProps) {
  const [shouldRender, setShouldRender] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/75 backdrop-blur-sm transition-opacity duration-700 ease-in-out ${
        isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Responsive Wrapper:
        - Mobile: Fixed 350x350 square so the shader doesn't stretch vertically.
        - Desktop (md:): Goes back to full screen width/height.
        - CSS Mask: Guarantees the edges smoothly fade out, preventing the "hard box" look.
      */}
      <div
        className="absolute w-[350px] h-[350px] md:w-full md:h-full pointer-events-none flex items-center justify-center"
        style={{
          maskImage: "radial-gradient(circle, black 30%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(circle, black 30%, transparent 70%)",
        }}
      >
        <div className="absolute inset-0 w-full h-full">
          <Strands
            count={3}
            speed={0.5}
            amplitude={1}
            waviness={1}
            thickness={0.7}
            glow={2.6}
            taper={3}
            spread={1}
            intensity={0.6}
            saturation={2}
            opacity={1}
            scale={1.5}
            glass={false}
            refraction={1}
            dispersion={1}
            glassSize={1}
            hueShift={0}
          />
        </div>
      </div>

      {message && (
        <div className="relative z-10 text-white font-medium tracking-wide text-lg text-center bg-black/50 px-4 py-2 rounded">
          {message}
        </div>
      )}
    </div>
  );
}
