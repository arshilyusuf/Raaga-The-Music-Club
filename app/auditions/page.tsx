"use client";

import { useMemo, useState } from "react";
import ShinyText from "@/Reactbits/ShinyText";
import Grainient from "@/Reactbits/Grainient";
import { AnimatePresence,motion} from "framer-motion";

export default function Page() {
  const [type, setType] = useState<"vocal" | "instrumental">("vocal");
  const colors = useMemo(() => {
    if (type === "vocal") {
      return { c1: "#722f37", c2: "#bd9398", c3: "#5b0b14" };
    } else {
      return { c1: "#0e6227", c2: "#4aa244", c3: "#075414" };
    }
  }, [type]);
  const fieldVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 10, transition: { duration: 0.3 } },
  };
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col justify-center items-center px-6 py-12">
      <div className="absolute inset-0 -z-10">
          <Grainient
            color1={colors.c1}
            color2={colors.c2}
            color3={colors.c3}
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
          />{" "}
      </div>

      <ShinyText
        text="REGISTER FOR THE AUDITIONS"
        speed={4}
        color={type === "vocal" ? "#ffffff" : "#ffffff"} // keep main text white
        shineColor={colors.c1} // shine changes with type
        spread={120}
        direction="left"
        className="text-3xl font-bold mb-8"
      />

      <form className="w-full max-w-4xl space-y-6">
        {/* Type Selection */}
        <div className="flex gap-6 mb-6 w-full max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setType("vocal")}
            className={`flex-1 px-6 py-2 border border-white font-semibold
    transition-all duration-300 active:scale-90
    ${type === "vocal" ? "bg-white text-black scale-105" : "bg-transparent text-white hover:bg-white/20"}`}
          >
            Vocalist
          </button>

          <button
            type="button"
            onClick={() => setType("instrumental")}
            className={`flex-1 px-6 py-2 border border-white font-semibold
    transition-all duration-300 active:scale-90
    ${type === "instrumental" ? "bg-white text-black scale-105" : "bg-transparent text-white hover:bg-white/20"}`}
          >
            Instrumentalist
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="col-span-2 flex flex-col">
            <label className="font-semibold mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Enter full name"
              className="input"
            />
          </div>

          {/* Roll Number */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Roll Number</label>
            <input
              type="text"
              placeholder="Enter roll number"
              className="input"
            />
          </div>

          {/* Branch */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Branch</label>
            <input type="text" placeholder="Enter branch" className="input" />
          </div>

          {/* Year */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Year</label>
            <input type="text" placeholder="Enter year" className="input" />
          </div>

          {/* Phone Number */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Phone Number</label>
            <input
              type="tel"
              placeholder="Enter phone number"
              className="input"
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                target.value = target.value.replace(/\D/g, "");
              }}
            />
          </div>

           {/* Conditional Fields */}
          <AnimatePresence mode="wait">
            {type === "vocal" && (
              <motion.div
                className="col-span-2 flex flex-col space-y-4"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={fieldVariants}
              >
                <div className="flex flex-col">
                  <label className="font-semibold mb-1">Languages You Sing In</label>
                  <input type="text" placeholder="Enter languages" className="input" />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold mb-1">Links to Backing Tracks / Karaoke (if any)</label>
                  <input type="url" placeholder="Paste link(s) here" className="input" />
                </div>
              </motion.div>
            )}

            {type === "instrumental" && (
              <motion.div
                className="col-span-2 space-y-4"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={fieldVariants}
              >
                <p className="mb-2 font-semibold">Instruments</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-sm">
                  {["Guitar","Keyboard","Drums","Violin","Harmonium","Flute","Tabla/Dholak","Other"].map((inst) => (
                    <label key={inst} className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" name="instruments" value={inst} className="peer hidden" />
                      <span className="w-5 h-5 rounded border-2 border-white flex-shrink-0 flex items-center justify-center peer-checked:bg-white transition-colors duration-200">
                        <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: colors.c1 }} />
                      </span>
                      <span className="text-white">{inst}</span>
                    </label>
                  ))}
                </div>

                <div className="mt-4 border-t">
                  <label className="flex mt-3 items-center gap-3 cursor-pointer select-none">
                    <input type="checkbox" name="requireInstrument" className="peer hidden" />
                    <span className="w-5 h-5 rounded border-2 border-white flex items-center justify-center peer-checked:bg-white transition-colors duration-200">
                      <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: colors.c1 }} />
                    </span>
                    <span className="text-white font-semisemibold">Requirement for instrument from our side</span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Remarks */}
          <div className="col-span-2 flex flex-col">
            <label className="font-semibold mb-1">Remarks (optional)</label>
            <input type="text" placeholder="Enter remarks" className="input" />
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 w-full border border-white py-3 font-semibold hover:bg-white hover:text-black transition"
        >
          Submit Registration
        </button>
      </form>
    </div>
  );
}
