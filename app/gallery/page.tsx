'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client'; // Adjust path based on your folder structure
import Event from "@/components/Event";
import Footer from "@/components/Footer";
import Grainient from "@/Reactbits/Grainient";

interface AcademicYearRelation {
  label: string;
}

interface DbPhoto {
  id: string;
  cloudinary_url: string;
  caption: string | null;
  academic_years: AcademicYearRelation | null;
}

export default function Page() {
  const [shruti25Items, setShruti25Items] = useState<any[]>([]);
  const [shruti24Items, setShruti24Items] = useState<any[]>([]);
  const [shruti23Items, setShruti23Items] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    async function fetchGalleryPhotos() {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('history_photos')
          .select(`
            id,
            cloudinary_url,
            caption,
            academic_years (
              label
            )
          `);

        if (error) throw error;

        if (data) {
          const rawPhotos = data as unknown as DbPhoto[];

          const mapPhotosByYearLabel = (label: string) => {
            const fallbackHeights = [400, 250, 600, 500, 300, 450, 350, 550, 480, 320, 600, 420, 470, 360, 510, 580, 340, 440, 520, 380];
            
            return rawPhotos
              .filter((photo) => photo.academic_years?.label === label)
              .map((photo, index) => ({
                id: photo.id,
                img: photo.cloudinary_url,
                url: photo.cloudinary_url,
                height: fallbackHeights[index % fallbackHeights.length],
              }));
          };

          setShruti25Items(mapPhotosByYearLabel('2025-26'));
          setShruti24Items(mapPhotosByYearLabel('2024-25'));
          setShruti23Items(mapPhotosByYearLabel('2023-24'));
        }
      } catch (err) {
        console.error('Error fetching gallery photos:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchGalleryPhotos();
  }, []);

  return (
    <div className="relative flex flex-col justify-center w-full min-h-full">
      <div className="absolute sm:fixed left-13 top-0 sm:top-3 lg:top-5  sm:left-1/2 sm:-translate-x-1/2 z-50">
        <div className="flex">
          <img
            src="/svg-path.svg"
            className="hidden sm:block scale-x-[-1] h-9 w-auto max-h-full"
          />
          <div className="bg-black sm:rounded-bl-2xl rounded-br-2xl px-2 sm:px-4 pb-0 sm:pb-2 pl-4 sm:pl-4 ">
            <h1
              className="text-center font-bold text-2xl sm:text-4xl bg-gradient-to-br from-yellow-200 to-white
        bg-clip-text text-transparent drop-shadow-[0_8px_25px_rgba(0,0,0,0.9)]"
            >
              GALLERY
            </h1>
          </div>
          <img src="/svg-path.svg" className="h-9 w-auto max-h-full" />
        </div>
      </div>

      <div className="absolute inset-0 -z-10">
        <Grainient
          color1="#722f37"
          color2="#bd9398"
          color3="#5b0b14"
          timeSpeed={0.25}
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
      ) : (
        <div className="mt-10">
          <div className="mb-5 border-b border-zinc-50">
            <Event eventName="Shruti'25" date="January 9, 2026" items={shruti25Items} />
          </div>
          <div className="mb-5 border-b border-zinc-50">
            <Event eventName="Shruti'24" date="November 13, 2024" items={shruti24Items} />
          </div>
          <div className="">
            <Event eventName="Shruti'23" date="October 12, 2023" items={shruti23Items} />
          </div>
        </div>
      )}
    </div>
  );
}