"use client";
import { motion } from "framer-motion";

import Image from "next/image";
import Button from "./Button";
import { useRouter } from "next/navigation";

export default function Section1() {
  const handleAnimationComplete = () => {
    console.log("All letters have animated!");
  };
  const router = useRouter();

  return (
    <div className="relative w-full h-full overflow-hidden flex items-start justify-start sm:p-16 px-6">
      {/* Background Image */}
      <Image
        src="/pictures/Section1BG.png"
        alt="Shruti Music Eve"
        fill
        priority
        className="object-cover scale-105"
      />
      <div className="absolute inset-0 bg-linear-to-b from-[#242d06] via-[#242d06]/40 to-transparent z-10" />
      <div className="relative flex flex-col items-center sm:pt-0  z-20 sm:max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1.25,
            ease: [0.22, 1, 0.36, 1],
          }}
          viewport={{ margin: "-100px", once: true }}
          className="sm:text-[4rem] sm:mt-0 mt-20 text-3xl font-bold text-left leading-[1.1]
bg-linear-to-br from-yellow-200 to-white
bg-clip-text text-transparent
drop-shadow-[0_8px_25px_rgba(0,0,0,0.9)]"
        >
          Shruti - The Annual Music Eve
        </motion.div>

        <p className="mt-6 sm:text-lg text-baseleading-relaxed text-zinc-100 drop-shadow-[0_6px_20px_rgba(0,0,0,0.9)]">
          Shruti is Raaga’s flagship annual music evening, where the club’s
          talented performers come together to showcase a diverse range of
          music—from soulful vocals to intricate instrumental pieces. The event
          features carefully arranged performances that highlight both
          individual skill and collaborative creativity, giving performers a
          platform to experiment and express themselves. Audiences witness a
          dynamic mix of styles and genres, with each act crafted to engage,
          move, and inspire, making Shruti not just a showcase of talent but a
          celebration of music as a living, shared experience.
        </p>
        <Button text="View Gallery" onClick={() => router.push("/gallery")} />
      </div>
      
    </div>
  );
}
