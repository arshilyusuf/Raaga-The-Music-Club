"use client";

import { motion } from "framer-motion";
import Section1 from "./Section1";
import Section2 from "./Section2";
const animationProps = {
  initial: { opacity: 0, y: 80, scale: 0.95 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  transition: {
    duration: 0.9,
    ease: [0.22, 1, 0.36, 1] as const,
  },
  viewport: { once: false, margin: "-100px" },
};

export default function SmoothScrollSections() {
  return (
    <section
      className="w-full"
      style={{
        background:
          "linear-gradient(to bottom, #242d06 0%, #242d06 50%, #242d06 100%)",
      }}
    >
      <motion.div
        className="relative h-screen flex items-center justify-center"
        {...animationProps}
      >
        <Section1 />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 md:h-64 bg-linear-to-b from-[#242d06] from-10% to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 md:h-64 bg-linear-to-t from-[#131609] from-20% to-transparent" />
      </motion.div>

      <motion.div
        className="relative h-screen flex items-center justify-center"
        {...animationProps}
      >
        <Section2 />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 md:h-64 bg-linear-to-b from-[#131609] from-20% to-transparent" />
      </motion.div>
    </section>
  );
}