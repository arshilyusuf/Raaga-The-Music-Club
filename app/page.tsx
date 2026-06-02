"use client";

import { motion } from "framer-motion";
import MagicRings from "@/Reactbits/MagicRings";
import InfiniteMenu from "@/Reactbits/InfiniteMenu";
import CurvedLoop from "@/Reactbits/CurvedLoop";
import TextPressure from "@/Reactbits/TextPressure";
import ScrollTimeline from "@/components/ScrollTimeline";
import { useEffect, useState } from "react";
import DomeGallery from "@/Reactbits/DomeGallery";
import CircularText from "@/Reactbits/CircularText";
import Button from "@/components/Button";
import { CartoonButton } from "@/components/ui/CartoonButton";
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
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <main className="relative min-h-screen w-full text-zinc-50 overflow-hidden ">
      {/* {isMobile ? (
        <div className="absolute w-full h-screen mt-20 flex items-center justify-center z-[300] pointer-events-none">
          <CircularText
            text="AUDITIONS ✦ COMING ✦ SOON ✦ "
            onHover="speedUp"
            spinDuration={20}
            className="custom-class"
          />
        </div>
      ) : (
        <div className="pointer-events-none sm:top-30 absolute z-[300] left-5 sm:left-10 right-0 w-[calc(100%-1.25rem)] sm:w-full">
          <CurvedLoop
            marqueeText="Auditions ✦ coming ✦ soon ✦ "
            speed={2}
            curveAmount={200}
            direction="right"
            interactive
            className="w-full"
          />
        </div>
      )} */}
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
          className="flex flex-col items-center justify-center text-center -mt-30 sm:mt-0"
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
            <div className="relative w-120 sm:w-full  sm:h-full h-full">
              {isMobile ? (
                <h1 className="text-6xl mt-10 font-black text-white">RAAGA</h1>
              ) : (
                <TextPressure
                  text="RAAGA"
                  flex={false}
                  alpha={false}
                  stroke
                  scale={false}
                  weight
                  strokeColor="#722f37"
                  strokeWidth={10}
                  width={true}
                  italic
                  textColor="#ffffff"
                  minFontSize={260}
                />
              )}
            </div>
            <span className="block text-2xl sm:text-lg md:text-xl lg:text-2xl font-black text-zinc-100/90 tracking-widest">
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
          ></motion.div>
          <motion.p
            className="sm:-mt-4 text-lg sm:text-xl md:text-lg font-medium text-zinc-200/90"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 2.0,
              duration: 4.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            The official music club of <br className="block sm:hidden " /> NIT
            Raipur{" "}
          </motion.p>
          <div className="mt-6">
            <motion.p
              className=" text-md sm:text-lg md:text-md text-zinc-100"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 2.5,
                duration: 5.7,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              Auditions are now open!
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 3.0,
                duration: 6.7,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <CartoonButton
                label="REGISTER NOW"
                color="mt-3 bg-[#6b0527]/30 backdrop-blur font-semibold text-white border-white"
                onClick={() => {
                  window.location.href = "/auditions";
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      </section>
      <section className="h-[100vh] sm:min-h-fit w-full bg-[#722f37] relative">
        {/* DomeGallery for mobile */}
        <div className="block lg:hidden w-full h-screen sm:mb-0 -mb-30">
          <DomeGallery
            fit={0.8}
            minRadius={600}
            maxVerticalRotationDeg={0}
            segments={34}
            dragDampening={2}
            grayscale
            overlayBlurColor="#722f37"
          />
        </div>

        {/* InfiniteMenu for larger screens */}
        <div className="hidden lg:block h-full w-full relative">
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
