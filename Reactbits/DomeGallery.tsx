import { useEffect, useMemo, useRef } from "react";

type ImageItem = string | { src: string; alt?: string };

type DomeGalleryProps = {
  images?: ImageItem[];
  fit?: number;
  fitBasis?: "auto" | "min" | "max" | "width" | "height";
  minRadius?: number;
  maxRadius?: number;
  padFactor?: number;
  overlayBlurColor?: string;
  segments?: number;
  imageBorderRadius?: string;
  grayscale?: boolean;
  /** Degrees per second for auto-spin. Default: 6 */
  autoSpinSpeed?: number;
};

type ItemDef = {
  src: string;
  alt: string;
  x: number;
  y: number;
  sizeX: number;
  sizeY: number;
};

const DEFAULT_IMAGES: ImageItem[] = [
  { src: "/pictures/domeGallery/Shruti - 17.jpg", alt: "Shruti 23" },
  { src: "/pictures/domeGallery/Shruti - 4.jpg", alt: "Shruti 25" },
  { src: "/pictures/domeGallery/Shruti - 22.jpg", alt: "Shruti 22" },
  { src: "/pictures/domeGallery/Shruti - 9.jpg", alt: "Shruti 24" },
  { src: "/pictures/domeGallery/Shruti - 1.jpg", alt: "Shruti 22" },
  { src: "/pictures/domeGallery/Shruti - 25.jpg", alt: "Shruti 22" },
  { src: "/pictures/domeGallery/Shruti - 13.jpg", alt: "Shruti 24" },
  { src: "/pictures/domeGallery/Shruti - 7.jpg", alt: "Shruti 23" },
  { src: "/pictures/domeGallery/Shruti - 28.jpg", alt: "Shruti 22" },
  { src: "/pictures/domeGallery/Shruti - 19.jpg", alt: "Shruti 24" },
  { src: "/pictures/domeGallery/Shruti - 3.jpg", alt: "Shruti 25" },
  { src: "/pictures/domeGallery/Shruti - 14.jpg", alt: "Shruti 24" },
  { src: "/pictures/domeGallery/Shruti - 23.jpg", alt: "Shruti 23" },
  { src: "/pictures/domeGallery/Shruti - 6.jpg", alt: "Shruti 25" },
  { src: "/pictures/domeGallery/Shruti - 11.jpg", alt: "Shruti 22" },
  { src: "/pictures/domeGallery/Shruti - 26.jpg", alt: "Shruti 22" },
  { src: "/pictures/domeGallery/Shruti - 16.jpg", alt: "Shruti 23" },
  { src: "/pictures/domeGallery/Shruti - 2.jpg", alt: "Shruti 23" },
  { src: "/pictures/domeGallery/Shruti - 20.jpg", alt: "Shruti 24" },
  { src: "/pictures/domeGallery/Shruti - 8.jpg", alt: "Shruti 24" },
  { src: "/pictures/domeGallery/Shruti - 24.jpg", alt: "Shruti 24" },
  { src: "/pictures/domeGallery/Shruti - 5.jpg", alt: "Shruti 25" },
  { src: "/pictures/domeGallery/Shruti - 15.jpg", alt: "Shruti 23" },
  { src: "/pictures/domeGallery/Shruti - 21.jpg", alt: "Shruti 22" },
  { src: "/pictures/domeGallery/Shruti - 10.jpg", alt: "Shruti 24" },
  { src: "/pictures/domeGallery/Shruti - 27.jpg", alt: "Shruti 22" },
  { src: "/pictures/domeGallery/Shruti - 18.jpg", alt: "Shruti 24" },
  { src: "/pictures/domeGallery/Shruti - 12.jpg", alt: "Shruti 24" },
];

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

function buildItems(pool: ImageItem[], seg: number): ItemDef[] {
  const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
  const evenYs = [-4, -2, 0, 2, 4];
  const oddYs = [-3, -1, 1, 3, 5];

  const coords = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs;
    return ys.map((y) => ({ x, y, sizeX: 2, sizeY: 2 }));
  });

  const totalSlots = coords.length;
  if (pool.length === 0) return coords.map((c) => ({ ...c, src: "", alt: "" }));

  const normalizedImages = pool.map((image) =>
    typeof image === "string"
      ? { src: image, alt: "" }
      : { src: image.src || "", alt: image.alt || "" },
  );

  const usedImages = Array.from(
    { length: totalSlots },
    (_, i) => normalizedImages[i % normalizedImages.length],
  );

  // Avoid adjacent duplicates
  for (let i = 1; i < usedImages.length; i++) {
    if (usedImages[i].src === usedImages[i - 1].src) {
      for (let j = i + 1; j < usedImages.length; j++) {
        if (usedImages[j].src !== usedImages[i].src) {
          [usedImages[i], usedImages[j]] = [usedImages[j], usedImages[i]];
          break;
        }
      }
    }
  }

  return coords.map((c, i) => ({
    ...c,
    src: usedImages[i].src,
    alt: usedImages[i].alt,
  }));
}

export default function DomeGallery({
  images = DEFAULT_IMAGES,
  fit = 0.5,
  fitBasis = "auto",
  minRadius = 600,
  maxRadius = Infinity,
  padFactor = 0.25,
  overlayBlurColor = "#060010",
  segments = 35,
  imageBorderRadius = "30px",
  grayscale = true,
  autoSpinSpeed = 1.5,
}: DomeGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const rotYRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const items = useMemo(() => buildItems(images, segments), [images, segments]);

  const applyTransform = (yDeg: number) => {
    if (sphereRef.current) {
      sphereRef.current.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(0deg) rotateY(${yDeg}deg)`;
    }
  };

  // Radius / CSS variable setup
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      const w = Math.max(1, cr.width);
      const h = Math.max(1, cr.height);
      const minDim = Math.min(w, h);
      const maxDim = Math.max(w, h);
      const aspect = w / h;
      let basis: number;
      switch (fitBasis) {
        case "min":
          basis = minDim;
          break;
        case "max":
          basis = maxDim;
          break;
        case "width":
          basis = w;
          break;
        case "height":
          basis = h;
          break;
        default:
          basis = aspect >= 1.3 ? w : minDim;
      }
      let radius = basis * fit;
      radius = Math.min(radius, h * 1.35);
      radius = clamp(radius, minRadius, maxRadius);
      const viewerPad = Math.max(8, Math.round(minDim * padFactor));
      root.style.setProperty("--radius", `${Math.round(radius)}px`);
      root.style.setProperty("--viewer-pad", `${viewerPad}px`);
      root.style.setProperty("--overlay-blur-color", overlayBlurColor);
      root.style.setProperty("--tile-radius", imageBorderRadius);
      root.style.setProperty(
        "--image-filter",
        grayscale ? "grayscale(1)" : "none",
      );
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [
    fit,
    fitBasis,
    minRadius,
    maxRadius,
    padFactor,
    overlayBlurColor,
    grayscale,
    imageBorderRadius,
  ]);

  // Auto-spin loop — no touch, no drag, just RAF
  useEffect(() => {
    const tick = (ts: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = ts;
      const dt = (ts - lastTimeRef.current) / 1000; // seconds
      lastTimeRef.current = ts;
      rotYRef.current = (rotYRef.current + autoSpinSpeed * dt) % 360;
      applyTransform(rotYRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [autoSpinSpeed]);

  const cssStyles = `
    .sphere-root {
      --radius: 520px;
      --viewer-pad: 72px;
      --circ: calc(var(--radius) * 3.14);
      --rot-y: calc((360deg / var(--segments-x)) / 2);
      --rot-x: calc((360deg / var(--segments-y)) / 2);
      --item-width: calc(var(--circ) / var(--segments-x));
      --item-height: calc(var(--circ) / var(--segments-y));
    }
    .sphere-root * { box-sizing: border-box; }
    .sphere, .sphere-item, .item__image { transform-style: preserve-3d; }
    .stage {
      width: 100%;
      height: 100%;
      display: grid;
      place-items: center;
      position: absolute;
      inset: 0;
      margin: auto;
      perspective: calc(var(--radius) * 2);
      perspective-origin: 50% 50%;
    }
    .sphere {
      transform: translateZ(calc(var(--radius) * -1));
      will-change: transform;
      position: absolute;
    }
    .sphere-item {
      width: calc(var(--item-width) * var(--item-size-x));
      height: calc(var(--item-height) * var(--item-size-y));
      position: absolute;
      top: -999px; bottom: -999px; left: -999px; right: -999px;
      margin: auto;
      transform-origin: 50% 50%;
      backface-visibility: hidden;
      transform: rotateY(calc(var(--rot-y) * (var(--offset-x) + ((var(--item-size-x) - 1) / 2))))
                 rotateX(calc(var(--rot-x) * (var(--offset-y) - ((var(--item-size-y) - 1) / 2))))
                 translateZ(var(--radius));
    }
    .item__image {
      position: absolute;
      inset: 10px;
      border-radius: var(--tile-radius, 12px);
      overflow: hidden;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      pointer-events: none;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />
      <div
        ref={rootRef}
        className="sphere-root relative w-full h-full"
        style={
          {
            ["--segments-x" as any]: segments,
            ["--segments-y" as any]: segments,
            ["--overlay-blur-color" as any]: overlayBlurColor,
            ["--tile-radius" as any]: imageBorderRadius,
            ["--image-filter" as any]: grayscale ? "grayscale(1)" : "none",
          } as React.CSSProperties
        }
      >
        <main
          className="absolute inset-0 grid place-items-center overflow-hidden select-none bg-transparent"
          style={{ touchAction: "auto", WebkitUserSelect: "none" }}
        >
          <div className="stage">
            <div ref={sphereRef} className="sphere">
              {items.map((it, i) => (
                <div
                  key={`${it.x},${it.y},${i}`}
                  className="sphere-item absolute m-auto"
                  style={
                    {
                      ["--offset-x" as any]: it.x,
                      ["--offset-y" as any]: it.y,
                      ["--item-size-x" as any]: it.sizeX,
                      ["--item-size-y" as any]: it.sizeY,
                      top: "-999px",
                      bottom: "-999px",
                      left: "-999px",
                      right: "-999px",
                    } as React.CSSProperties
                  }
                >
                  <div
                    className="item__image absolute block overflow-hidden bg-gray-200"
                    style={{
                      inset: "10px",
                      borderRadius: `var(--tile-radius, ${imageBorderRadius})`,
                      backfaceVisibility: "hidden",
                    }}
                  >
                    <img
                      src={it.src}
                      draggable={false}
                      alt={it.alt}
                      className="w-full h-full object-cover pointer-events-none"
                      style={{
                        backfaceVisibility: "hidden",
                        filter: `var(--image-filter, ${grayscale ? "grayscale(1)" : "none"})`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Radial vignette overlay */}
          <div
            className="absolute inset-0 m-auto z-[3] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(rgba(235,235,235,0) 65%, var(--overlay-blur-color, ${overlayBlurColor}) 100%)`,
            }}
          />
          {/* Blur ring */}
          <div
            className="absolute inset-0 m-auto z-[3] pointer-events-none"
            style={{
              WebkitMaskImage: `radial-gradient(rgba(235,235,235,0) 70%, var(--overlay-blur-color, ${overlayBlurColor}) 90%)`,
              maskImage: `radial-gradient(rgba(235,235,235,0) 70%, var(--overlay-blur-color, ${overlayBlurColor}) 90%)`,
              backdropFilter: "blur(3px)",
            }}
          />
          {/* Top/bottom fade */}
          <div
            className="absolute left-0 right-0 top-0 h-[120px] z-[5] pointer-events-none rotate-180"
            style={{
              background: `linear-gradient(to bottom, transparent, var(--overlay-blur-color, ${overlayBlurColor}))`,
            }}
          />
          <div
            className="absolute left-0 right-0 bottom-0 h-[120px] z-[5] pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, transparent, var(--overlay-blur-color, ${overlayBlurColor}))`,
            }}
          />
        </main>
      </div>
    </>
  );
}
