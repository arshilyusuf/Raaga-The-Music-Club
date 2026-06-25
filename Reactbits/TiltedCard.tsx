"use client";
import type { SpringOptions } from "motion/react";
import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import Image from "next/image";

// Detect touch/mobile once — avoids per-render overhead
const IS_MOBILE =
  typeof window !== "undefined" &&
  (window.matchMedia("(pointer: coarse)").matches ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

const getCloudinaryBlurUrl = (url?: string) => {
  if (!url || typeof url !== "string" || !url.includes("res.cloudinary.com"))
    return undefined;
  const parts = url.split("/upload/");
  if (parts.length === 2) {
    return `${parts[0]}/upload/w_50,e_blur:1000,q_10,f_auto/${parts[1]}`;
  }
  return undefined;
};

const cloudinaryLoader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => {
  if (!src.includes("res.cloudinary.com")) return src;
  const params = `f_auto,q_${quality || "auto"},c_limit,w_${width}`;
  return src.replace("/upload/", `/upload/${params}/`);
};

interface TiltedCardProps {
  imageSrc: string;
  altText?: string;
  captionText?: string;
  containerHeight?: React.CSSProperties["height"];
  containerWidth?: React.CSSProperties["width"];
  imageHeight?: React.CSSProperties["height"];
  imageWidth?: React.CSSProperties["width"];
  scaleOnHover?: number;
  rotateAmplitude?: number;
  showMobileWarning?: boolean;
  showTooltip?: boolean;
  overlayContent?: React.ReactNode;
  displayOverlayContent?: boolean;
}

const springValues: SpringOptions = {
  damping: 30,
  stiffness: 100,
  mass: 2,
};

// ─── Mobile variant: pure CSS, zero JS on interaction ───────────────────────
function TiltedCardMobile({
  imageSrc,
  altText = "Tilted card image",
  containerHeight = "300px",
  containerWidth = "100%",
  imageHeight = "300px",
  imageWidth = "100%",
  overlayContent,
  displayOverlayContent = false,
}: TiltedCardProps) {
  return (
    <figure
      className="relative flex flex-col items-center justify-center"
      style={{ height: containerHeight, width: containerWidth }}
    >
      <div
        className="relative overflow-hidden rounded-[15px]"
        style={{ width: imageWidth, height: imageHeight }}
      >
        <Image
          loader={cloudinaryLoader}
          src={imageSrc}
          alt={altText}
          fill
          sizes="(max-width: 768px) 100vw, 500px"
          placeholder={getCloudinaryBlurUrl(imageSrc) ? "blur" : "empty"}
          blurDataURL={getCloudinaryBlurUrl(imageSrc)}
          className="object-cover rounded-[15px]"
          // No will-change, no transform — just the image
        />
        {displayOverlayContent && overlayContent && (
          <div className="absolute top-0 left-0 z-[2] text-lg bg-black px-3 py-1 rounded-lg">
            {overlayContent}
            <p className="text-zinc-200 text-sm">{altText}</p>
          </div>
        )}
      </div>
    </figure>
  );
}

// ─── Desktop variant: full Framer Motion springs ─────────────────────────────
function TiltedCardDesktop({
  imageSrc,
  altText = "Tilted card image",
  captionText = "",
  containerHeight = "300px",
  containerWidth = "100%",
  imageHeight = "300px",
  imageWidth = "100%",
  scaleOnHover = 1.1,
  rotateAmplitude = 14,
  showTooltip = true,
  overlayContent = null,
  displayOverlayContent = false,
}: TiltedCardProps) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);
  const opacity = useSpring(0);
  const rotateFigcaption = useSpring(0, {
    stiffness: 350,
    damping: 30,
    mass: 1,
  });
  const [lastY, setLastY] = useState(0);

  function handleMouse(e: React.MouseEvent<HTMLElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    rotateX.set((offsetY / (rect.height / 2)) * -rotateAmplitude);
    rotateY.set((offsetX / (rect.width / 2)) * rotateAmplitude);
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
    rotateFigcaption.set(-(offsetY - lastY) * 0.6);
    setLastY(offsetY);
  }

  function handleMouseEnter() {
    scale.set(scaleOnHover);
    opacity.set(1);
  }

  function handleMouseLeave() {
    opacity.set(0);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    rotateFigcaption.set(0);
  }

  return (
    <figure
      ref={ref}
      className="relative w-full h-full [perspective:800px] flex flex-col items-center justify-center"
      style={{ height: containerHeight, width: containerWidth }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative [transform-style:preserve-3d]"
        style={{
          width: imageWidth,
          height: imageHeight,
          rotateX,
          rotateY,
          scale,
        }}
      >
        <Image
          loader={cloudinaryLoader}
          src={imageSrc}
          alt={altText}
          fill
          sizes="(max-width: 768px) 100vw, 500px"
          placeholder={getCloudinaryBlurUrl(imageSrc) ? "blur" : "empty"}
          blurDataURL={getCloudinaryBlurUrl(imageSrc)}
          className="object-cover rounded-[15px] will-change-transform [transform:translateZ(0)]"
        />
        {displayOverlayContent && overlayContent && (
          <motion.div className="absolute top-0 left-0 z-[2] text-lg bg-black px-3 py-1 rounded-lg will-change-transform [transform:translateZ(30px)]">
            {overlayContent}
            <p className="text-zinc-200 text-light text-sm">{altText}</p>
          </motion.div>
        )}
      </motion.div>

      {showTooltip && (
        <motion.figcaption
          className="pointer-events-none absolute left-0 top-0 rounded-[4px] bg-white px-[10px] py-[4px] text-[10px] text-[#2d2d2d] opacity-0 z-[3] hidden sm:block"
          style={{ x, y, opacity, rotate: rotateFigcaption }}
        >
          {captionText}
        </motion.figcaption>
      )}
    </figure>
  );
}

// ─── Public export: picks the right variant at runtime ───────────────────────
export default function TiltedCard(props: TiltedCardProps) {
  if (IS_MOBILE) {
    // Never import or instantiate Framer Motion springs on mobile
    return <TiltedCardMobile {...props} />;
  }
  return <TiltedCardDesktop {...props} />;
}
