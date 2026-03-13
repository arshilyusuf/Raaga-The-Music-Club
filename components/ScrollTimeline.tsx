"use client";

import { motion } from "framer-motion";
import Section1 from "./Section1";

export default function SmoothScrollSections() {
  const sections = Array.from({ length: 10 });

  return (
    <section
      className="w-full"
      style={{
        background:
          "linear-gradient(to bottom, #722f37 0%, #4a1f24 50%, #2a1215 100%)",
      }}
    >
      {sections.map((_, i) => (
        <motion.div
          key={i}
          className="h-screen flex items-center justify-center"
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
          }}
          viewport={{ once: false, margin: "-100px" }}
        >
          {i === 0 ? (
            <Section1 />
          ) : (
            <motion.div
              className="text-white text-6xl font-bold tracking-wide"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2,
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              Section {i + 1}
            </motion.div>
          )}
        </motion.div>
      ))}
    </section>
  );
}