"use client";

import { useState } from "react";
import Masonry from "@/Reactbits/Masonry";
import ImagePopup from "@/components/ImagePopup";
import LazyImage from "@/components/LazyImage";
import Image from "next/image";

type MasonryItem = {
  id: string;
  img: string;
  url: string;
  height: number;
};

type EventProps = {
  eventName: string;
  date: string;
  items: MasonryItem[];
  clickclub?: boolean; 
};

export default function Event({ eventName, date, items, clickclub }: EventProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Replace raw Cloudinary URLs with lazy-loaded, blur-up wrappers.
  // We pass a custom `renderItem` so Masonry renders our LazyImage
  // instead of a plain <img>. Adjust the prop name if your Masonry
  // component uses something different (e.g. `render`, `itemRenderer`).
  const clickableItems = items.map((item) => ({
    ...item,
    // Keep the original img so Masonry can still read height/aspect if needed
    onClick: (img: string) => setSelectedImage(img),
    // Provide a render override for Masonry items
    renderContent: () => (
      <LazyImage
        src={item.img}
        height={item.height}
        maxWidth={800}
        className="w-full rounded-lg cursor-pointer"
        onClick={() => setSelectedImage(item.img)}
      />
    ),
  }));

  return (
    <section className="w-full min-h-screen flex flex-col items-center px-6 py-16">
      <h2 className="text-5xl font-semibold text-center">{eventName}</h2>
      {clickclub && (
        <a
          href="https://www.instagram.com/clickclubnitrr/"
          target="_blank"
          rel="noopener noreferrer"
          className=" bottom-6 flex items-center justify-center gap-1.5 text-white/50 hover:text-white transition-colors duration-300 text-sm font-medium tracking-wide drop-shadow-md cursor-pointer"
        >
          Shot by{" "}
          <Image
            src="/pictures/Click White Logo.webp"
            alt="Click Club Logo"
            width={20}
            height={24}
            className=""
          />
          Click Club, NITRR
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
            />
          </svg>
        </a>
      )}
      <p className="text-zinc-200 text-lg mt-2 mb-10">{date}</p>

      <div className="w-full max-w-7xl">
        <Masonry
          items={clickableItems}
          ease="power3.out"
          duration={0.6}
          stagger={0.05}
          animateFrom="bottom"
          scaleOnHover
          hoverScale={0.95}
          blurToFocus
          colorShiftOnHover
        />
      </div>

      <ImagePopup src={selectedImage} onClose={() => setSelectedImage(null)} />
    </section>
  );
}
