"use client";

import { useState } from "react";
import Masonry from "@/Reactbits/Masonry";
import ImagePopup from "@/components/ImagePopup";

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
};

export default function Event({ eventName, date, items }: EventProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

const clickableItems = items.map((item) => ({
  ...item,
  onClick: (img: string) => setSelectedImage(img),
}));

  return (
    <section className="w-full min-h-screen flex flex-col items-center px-6 py-16">
      <h2 className="text-5xl font-semibold text-center">{eventName}</h2>
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