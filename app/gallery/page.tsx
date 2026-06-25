'use client';

import { useEffect, useState } from 'react';
import Event from "@/components/Event";
import Grainient from "@/Reactbits/Grainient";
import GradualBlur from '@/Reactbits/GradualBlur';

interface GalleryGroup {
  id: string;
  yearLabel: string;
  eventName: string;
  date: string;
  items: any[];
}

export default function GalleryPage() {
  const [galleryGroups, setGalleryGroups] = useState<GalleryGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGallery() {
      try {
        setLoading(true);
        const response = await fetch("/api/gallery");
        if (!response.ok) throw new Error("Failed fetching public gallery records");
        
        const data = await response.json();
        setGalleryGroups(data || []);
      } catch (err) {
        console.error('Error hydrating gallery interface:', err);
      } finally {
        setLoading(false);
      }
    }

    loadGallery();
  }, []);

  return (
    <div className="relative flex flex-col justify-center w-full min-h-full">
      <div className="absolute sm:fixed left-13 top-0 sm:top-3 lg:top-5 sm:left-1/2 sm:-translate-x-1/2 z-50">
        <div className="flex">
          <img
            src="/svg-path.svg"
            className="hidden sm:block scale-x-[-1] h-9 w-auto max-h-full"
            alt=""
          />
          <div className="bg-black sm:rounded-bl-2xl rounded-br-2xl px-2 sm:px-4 pb-0 sm:pb-2 pl-4 sm:pl-4">
            <h1 className="text-center font-bold text-2xl sm:text-4xl bg-linear-to-br from-yellow-200 to-white bg-clip-text text-transparent drop-shadow-[0_8px_25px_rgba(0,0,0,0.9)]">
              GALLERY
              
            </h1>
          </div>
          <img src="/svg-path.svg" className="h-9 w-auto max-h-full" alt="" />
        </div>
      </div>

      <div className="absolute inset-0 -z-10">
        <Grainient
          color1="#83A317"
          color2="#2A330B"
          color3="#2A330B"
          timeSpeed={0.05}
          colorBalance={0}
          warpStrength={3.35}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={114}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={3.3}
          grainAmount={0.1}
          grainScale={2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={1.6}
        />
      </div>
      
      {loading ? (
        <div className="text-center py-40 text-sm text-zinc-400">
          Loading gallery...
        </div>
      ) : galleryGroups.length === 0 ? (
        <div className="text-center py-40 text-sm text-zinc-100">
          No items found in the gallery gallery registry.
        </div>
      ) : (
        <div className="mt-10">
          {galleryGroups.map((group, index) => (
            <div 
              key={group.id} 
              className={index !== galleryGroups.length - 1 ? "mb-5 border-b border-zinc-50" : ""}
            >

              <Event 
                eventName={group.eventName} 
                date={group.date} 
                items={group.items} 
              />
            </div>
          ))}
        </div>
      )}
      <GradualBlur
        target="page"
        position="bottom"
        height="5rem"
        strength={2}
        divCount={5}
        curve="bezier"
        exponential
        opacity={1}
        animated="scroll"
      />
    </div>
  );
}