"use client";
import { motion } from "framer-motion";

import Image from "next/image";

export default function Section1() {
  const handleAnimationComplete = () => {
    console.log("All letters have animated!");
  };

  return (
    <div className="relative w-full h-full overflow-hidden flex items-start justify-start p-16">
      ```
      {/* Background Image */}
      <Image
        src="/pictures/Copy of Copy of NIK_0636.jpg"
        alt="Shruti Music Eve"
        fill
        priority
        className="object-cover scale-105"
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#722f37] via-[#722f37]/60 to-transparent z-10" />
      {/* Content */}
      <div className="relative mt-10 z-20 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1.25,
            ease: [0.22, 1, 0.36, 1],
          }}
          viewport={{ margin: "-100px" }}
          className="text-[4rem] font-bold text-left leading-[1.1]
bg-gradient-to-br from-yellow-200 to-white
bg-clip-text text-transparent
drop-shadow-[0_8px_25px_rgba(0,0,0,0.9)]"
        >
          Shruti - The Annual Music Eve
        </motion.div>

        <p className="mt-6 text-lg leading-relaxed text-zinc-100 drop-shadow-[0_6px_20px_rgba(0,0,0,0.9)]">
          Shruti is the flagship annual music evening of Raaga. It is a
          celebration of sound, rhythm, and artistic expression where our
          talented performers take the stage to create an unforgettable musical
          experience.
        </p>
      </div>
    </div>
  );
}
