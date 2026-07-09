"use client";
import { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import MagicRings from "@/Reactbits/MagicRings";
// import InfiniteMenu from "@/Reactbits/InfiniteMenu";
import CurvedLoop from "@/Reactbits/CurvedLoop";
import TextPressure from "@/Reactbits/TextPressure";
import ScrollTimeline from "@/components/ScrollTimeline";
import { useEffect, useState } from "react";
import DomeGallery from "@/Reactbits/DomeGallery";
import CircularText from "@/Reactbits/CircularText";
import Button from "@/components/Button";
import { CartoonButton } from "@/components/ui/CartoonButton";
import GradualBlur from "@/Reactbits/GradualBlur";
import Image from "next/image";
import { FaInstagram, FaYoutube, FaFacebook } from "react-icons/fa";

const InfiniteMenu = lazy(() => import("@/Reactbits/InfiniteMenu"));
export default function Home() {
  const items = [
    {
      image: "/pictures/domeGallery/Shruti - 6.jpg",
      link: "/gallery",
      title: "Shruti 25",
      description: "",
    },
    {
      image: "/pictures/domeGallery/Shruti - 1.jpg",
      link: "/gallery",
      title: "Shruti 22",
      description: "",
    },
    {
      image: "/pictures/domeGallery/Shruti - 2.jpg",
      link: "/gallery",
      title: "Shruti 23",
      description: "",
    },
    {
      image: "/pictures/domeGallery/Shruti - 3.jpg",
      link: "/gallery",
      title: "Shruti 25",
      description: "",
    },
    {
      image: "/pictures/domeGallery/Shruti - 4.jpg",
      link: "/gallery",
      title: "Shruti 25",
      description: "",
    },
    {
      image: "/pictures/domeGallery/Shruti - 5.jpg",
      link: "/gallery",
      title: "Shruti 25",
      description: "",
    },
    {
      image: "/pictures/domeGallery/Shruti - 7.jpg",
      link: "/gallery",
      title: "Shruti 23",
      description: "",
    },
    {
      image: "/pictures/domeGallery/Shruti - 8.jpg",
      link: "/gallery",
      title: "Shruti 24",
      description: "",
    },
    {
      image: "/pictures/domeGallery/Shruti - 9.jpg",
      link: "/gallery",
      title: "Shruti 24",
      description: "",
    },
    {
      image: "/pictures/domeGallery/Shruti - 10.jpg",
      link: "/gallery",
      title: "Shruti 24",
      description: "",
    },
    {
      image: "/pictures/domeGallery/Shruti - 11.jpg",
      link: "/gallery",
      title: "Shruti 22",
      description: "",
    },
    {
      image: "/pictures/domeGallery/Shruti - 12.jpg",
      link: "/gallery",
      title: "Shruti 24",
      description: "",
    },
    {
      image: "/pictures/domeGallery/Shruti - 13.jpg",
      link: "/gallery",
      title: "Shruti 24",
      description: "",
    },
    {
      image: "/pictures/domeGallery/Shruti - 14.jpg",
      link: "/gallery",
      title: "Shruti 24",
      description: "",
    },
    {
      image: "/pictures/domeGallery/Shruti - 15.jpg",
      link: "/gallery",
      title: "Shruti 23",
      description: "",
    },
    {
      image: "/pictures/domeGallery/Shruti - 16.jpg",
      link: "/gallery",
      title: "Shruti 23",
      description: "",
    },
    {
      image: "/pictures/domeGallery/Shruti - 17.jpg",
      link: "/gallery",
      title: "Shruti 23",
      description: "",
    },
    {
      image: "/pictures/domeGallery/Shruti - 18.jpg",
      link: "/gallery",
      title: "Shruti 24",
      description: "",
    },
    {
      image: "/pictures/domeGallery/Shruti - 19.jpg",
      link: "/gallery",
      title: "Shruti 24",
      description: "",
    },
    {
      image: "/pictures/domeGallery/Shruti - 20.jpg",
      link: "/gallery",
      title: "Shruti 24",
      description: "",
    },
    {
      image: "/pictures/domeGallery/Shruti - 21.jpg",
      link: "/gallery",
      title: "Shruti 22",
      description: "",
    },
    {
      image: "/pictures/domeGallery/Shruti - 22.jpg",
      link: "/gallery",
      title: "Shruti 22",
      description: "",
    },
    {
      image: "/pictures/domeGallery/Shruti - 23.jpg",
      link: "/gallery",
      title: "Shruti 22",
      description: "",
    },
    {
      image: "/pictures/domeGallery/Shruti - 24.jpg",
      link: "/gallery",
      title: "Shruti 22",
      description: "",
    },
    {
      image: "/pictures/domeGallery/Shruti - 25.jpg",
      link: "/gallery",
      title: "Shruti 22",
      description: "",
    },
    {
      image: "/pictures/domeGallery/Shruti - 26.jpg",
      link: "/gallery",
      title: "Shruti 22",
      description: "",
    },
    {
      image: "/pictures/domeGallery/Shruti - 27.jpg",
      link: "/gallery",
      title: "Shruti 22",
      description: "",
    },
    {
      image: "/pictures/domeGallery/Shruti - 28.jpg",
      link: "/gallery",
      title: "Shruti 22",
      description: "",
    },
  ];
  const [isMobile, setIsMobile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMenu(true);
    }, 2000); // 2 seconds

    return () => clearTimeout(timer);
  }, []);
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
      {isMobile ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 1.5,
            duration: 0.8,
            ease: "easeIn",
          }}
          className="absolute w-full h-screen mt-20 flex items-center justify-center z-[300] pointer-events-none"
        >
          <CircularText
            text="AUDITIONS ✦ COMING ✦ SOON ✦ "
            onHover="speedUp"
            spinDuration={20}
            className="custom-class"
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 1.5,
            duration: 0.8,
            ease: "easeIn",
          }}
          className="pointer-events-none sm:top-30 absolute z-[300] left-5 sm:left-10 right-0 w-[calc(100%-1.25rem)] sm:w-full"
        >
          <CurvedLoop
            marqueeText="Auditions ✦ coming ✦ soon ✦ "
            speed={2}
            curveAmount={200}
            direction="right"
            interactive
            className="w-full"
          />
        </motion.div>
      )}
      <section className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="absolute -top-2 inset-0 -z-10">
          {/* Desktop Image: Hidden on mobile, visible on medium screens (768px) and up */}
          <Image
            src="/pictures/Raaga26BGG.png"
            alt="Main Background Desktop"
            fill
            sizes="100vw"
            className="hidden md:block"
            style={{
              objectFit: "cover",
              objectPosition: "center",
            }}
            priority
            quality={70}
            draggable={false}
          />

          {/* Mobile Image: Visible on mobile, hidden on medium screens (768px) and up */}
          <Image
            src="/pictures/Raaga26BGMobile.png"
            alt="Main Background Mobile"
            fill
            sizes="100vw"
            className="block md:hidden"
            style={{
              objectFit: "cover",
              objectPosition: "center",
            }}
            priority
            draggable={false}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 -z-5 flex-col items-center justify-center">
          <div className="w-full h-full">
            <MagicRings
              color="#9ebc16"
              colorTwo="#9ebc16"
              ringCount={6}
              speed={0.5}
              attenuation={8.5}
              lineThickness={2}
              baseRadius={0.35}
              radiusStep={0.1}
              scaleRate={0.1}
              opacity={1}
              blur={1}
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
            className="sm:text-5xl md:text-6xl lg:text-7xl mb-1 -mt-45 tracking-normal leading-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.5,
              duration: 2.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <motion.div
              // 1. Changed w-120 to w-full to prevent mobile overflow
              // 2. Added flex justify-center items-center to center the image
              className="relative w-full h-full flex justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                type: "spring",
                damping: 6,
                stiffness: 50,
                delay: 1,
              }}
            >
              {isMobile ? (
                // <h1 className="text-6xl mt-10 font-black text-white [-webkit-text-stroke:14px_#252e08] [paint-order:stroke_fill]">
                //   RAAGA
                // </h1>
                <Image
                  src="/pictures/RaagaLogo1.png"
                  alt="RAAGA"
                  width={250}
                  height={200}
                  className="object-contain"
                  draggable={false}
                />
              ) : (
                // <TextPressure
                //   text="RAAGA"
                //   flex={false}
                //   alpha={false}
                //   stroke
                //   scale={false}
                //   weight
                //   strokeColor="#252e08"
                //   strokeWidth={13}
                //   width={true}
                //   italic
                //   textColor="#ffffff"
                //   minFontSize={260}
                // />
                <Image
                  src="/pictures/RaagaLogo1.png"
                  alt="RAAGA"
                  width={500}
                  height={200}
                  className="object-contain"
                  draggable={false}
                />
              )}
            </motion.div>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.5,
              duration: 3,
              ease: [0.22, 1, 0.36, 1],
            }}
          ></motion.div>
          <motion.p
            className="sm:-mt-3 text-[1rem] sm:text-xl md:text-lg font-medium text-zinc-200/90"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 1,
              duration: 2,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <span className="text-xl sm:text-3xl md:text-2xl font-bold text-white">
              THE MUSIC CLUB
            </span>
            <br />
            The official music club of NIT Raipur{" "}
          </motion.p>
          {/* <div className="mt-6">
            <motion.p
              className=" text-md sm:text-lg md:text-md text-zinc-100"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 1,
                duration: 2,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              Auditions are now open!
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 1.5,
                duration: 2,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <CartoonButton
                label="REGISTER NOW"
                color="mt-3 bg-[#9ebc16]/30 backdrop-blur font-semibold text-white border-white"
                onClick={() => {
                  window.location.href = "/auditions";
                }}
              />
            </motion.div>
          </div> */}
        </motion.div>
      </section>
      <section className="h-screen sm:min-h-fit w-full bg-[#252e08] relative">
        {/* DomeGallery for mobile */}
        <div
          className="block lg:hidden w-full h-screen -mb-30"
          style={{ pointerEvents: "none", touchAction: "none" }}
        >
          <DomeGallery
            fit={0.8}
            minRadius={600}
            segments={34}
            grayscale={false}
            overlayBlurColor="#252e08"
            autoSpinSpeed={2}
          />
        </div>

        <div className="hidden lg:block w-full h-screen bg-transparent">
          <InfiniteMenu items={items} scale={1.8} />
        </div>
        <a
          href="https://www.instagram.com/clickclubnitrr/"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-6 sm:left-18 left-5 z-20 flex items-center gap-1.5 text-white/50 hover:text-white transition-colors duration-300 text-sm font-medium tracking-wide drop-shadow-md cursor-pointer"
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
        {/* Top gradient */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-linear-to-b from-[#242d06] from-10% to-transparent" />
        {/* Bottom gradient */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-linear-to-t from-[#242d06] to-transparent" />
      </section>
      <ScrollTimeline />
      <GradualBlur
        target="page"
        position="bottom"
        height="5rem"
        strength={2}
        divCount={5}
        curve="bezier"
        exponential
        opacity={1}
        responsive={true}
      />
    </main>
  );
}
