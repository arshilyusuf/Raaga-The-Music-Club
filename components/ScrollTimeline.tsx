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
          "linear-gradient(to bottom, #722f37 0%, #4a1f24 50%, #2a1215 100%)",
      }}
    >
      <motion.div
        className="h-screen flex items-center justify-center"
        {...animationProps}
      >
        <Section1 />
      </motion.div>

      <motion.div
        className="h-screen flex items-center justify-center"
        {...animationProps}
      >
        <Section2 />
      </motion.div>
    </section>
  );
}