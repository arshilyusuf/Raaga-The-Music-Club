"use client";

import { motion } from "framer-motion";
import MagicRings from "@/Reactbits/MagicRings";
import InfiniteMenu from "@/Reactbits/InfiniteMenu";
import CircularText from "@/Reactbits/CircularText";
import CurvedLoop from "@/Reactbits/CurvedLoop";
import TextPressure from "@/Reactbits/TextPressure";
import ScrollTimeline from "@/components/ScrollTimeline";

export default function Home() {
  const items = [
    {
      image: "https://picsum.photos/300/300?grayscale",
      link: "https://google.com/",
      title: "Shruti 25",
      description: "This is pretty cool, right?",
    },
    {
      image: "https://picsum.photos/400/400?grayscale",
      link: "https://google.com/",
      title: "Shruti 24",
      description: "This is pretty cool, right?",
    },
    {
      image: "https://picsum.photos/500/500?grayscale",
      link: "https://google.com/",
      title: "Shruti 23",
      description: "This is pretty cool, right?",
    },
    {
      image: "https://picsum.photos/600/600?grayscale",
      link: "https://google.com/",
      title: "Shruti 22",
      description: "This is pretty cool, right?",
    },
  ];
  return (
    <main className="relative min-h-screen w-full text-zinc-50 overflow-hidden">
      <section className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10"
          style={{
            backgroundImage: "url('/pictures/Shruti25 Stage Background-2.png')",
          }}
        />
        <div className="pointer-events-none absolute inset-0 -z-5 flex-col items-center justify-center">
          <div className="w-full h-full">
            <MagicRings
              color="#93343f"
              colorTwo="#93343f"
              ringCount={6}
              speed={1}
              attenuation={8.5}
              lineThickness={2}
              baseRadius={0.35}
              radiusStep={0.1}
              scaleRate={0.1}
              opacity={1}
              blur={0}
              noiseAmount={0.1}
              rotation={0}
              ringGap={1.5}
              fadeIn={0.7}
              fadeOut={0.5}
              followMouse={false}
              mouseInfluence={0.2}
              hoverScale={1.2}
              parallax={0.05}
              clickBurst={false}
            />
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 6,
            mass: 0.7,
          }}
          className="flex flex-col items-center justify-center text-center"
        >
          <motion.h1
            className="sm:text-5xl md:text-6xl lg:text-7xl mb-6 -mt-40 tracking-normal leading-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.5,
              duration: 2.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {/* <span className="block font-black text-[10rem]">RAAGA</span> */}
            <div style={{ position: "relative", height: "100%" }}>
              <TextPressure
                text="RAAGA"
                flex
                alpha={false}
                stroke
                scale
                width
                weight
                strokeColor="#722f37"
                strokeWidth={10}
                italic
                textColor="#ffffff"
                minFontSize={300}
              />
            </div>
            <span className="block text-[4rem] font-black text-base sm:text-lg md:text-xl lg:text-2xl text-zinc-100/90 tracking-widest">
              THE MUSIC CLUB <br />
            </span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 1.5,
              duration: 3.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="left-15 pointer-events-none absolute inset-0 w-screen">
              <CurvedLoop
                marqueeText="Auditions ✦ coming ✦ soon ✦ "
                speed={2}
                curveAmount={400}
                direction="right"
                interactive
                className="w-full"
              />
            </div>
          </motion.div>
          <motion.p
            className="-mt-4 text-sm sm:text-base md:text-lg text-zinc-200/90"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 2.0,
              duration: 4.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            The official music community of NIT Raipur{" "}
          </motion.p>
        </motion.div>
      </section>
      <section className="min-h-screen w-full bg-[#722f37] relative">
  <div style={{ height: "100%", position: "relative" }}>
    <InfiniteMenu items={items} scale={1.8} />
  </div>

  {/* Top gradient */}
  <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#722f37] to-transparent" />

  {/* Bottom gradient */}
  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#722f37] to-transparent" />
</section>
      <ScrollTimeline />
    </main>
  );
}
