"use client";

import { useEffect, useState } from "react";
import Grainient from "@/Reactbits/Grainient";
import ProfileCard from "@/Reactbits/ProfileCard";
import TiltedCard from "@/Reactbits/TiltedCard";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import GradualBlur from "@/Reactbits/GradualBlur";
import LoadingOverlay from "@/components/LoadingOverlay";

type RosterState = {
  heads: any[];
  core: any[];
  exes: any[];
  management: any[];
  anchoring: any[];
};

export default function Page() {
  const [roster, setRoster] = useState<RosterState>({
    heads: [],
    core: [],
    exes: [],
    management: [],
    anchoring: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRosterData() {
      try {
        setLoading(true);
        const response = await fetch("/api/team/roster");
        const data = await response.json();

        if (!response.ok)
          throw new Error(data.error || "Roster connection breakdown");

        setRoster({
          heads: data.heads || [],
          core: data.core || [],
          exes: data.exes || [],
          management: data.management || [],
          anchoring: data.anchoring || [],
        });
      } catch (err) {
        console.error("Failed loading active public team roster maps:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRosterData();
  }, []);

  const colors = { c1: "#547d1f", c2: "#203604", c3: "#2A330B" };

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Dynamic Header Block Element */}
      <div className="absolute sm:fixed left-14 top-0 sm:top-3 lg:top-5 sm:left-1/2 sm:-translate-x-1/2 z-50">
        <div className="flex">
          <img
            src="/svg-path.svg"
            alt=""
            className="hidden sm:block scale-x-[-1] h-9 w-auto max-h-full"
          />
          <div className="bg-black sm:rounded-bl-2xl rounded-br-2xl px-2 sm:px-4 pb-0 sm:pb-2 pl-4 sm:pl-4">
            <h1 className="text-center font-bold text-2xl sm:text-4xl bg-linear-to-br from-yellow-200 to-white bg-clip-text text-transparent drop-shadow-[0_8px_25px_rgba(0,0,0,0.9)]">
              TEAM
            </h1>
          </div>
          <img src="/svg-path.svg" alt="" className="h-9 w-auto max-h-full" />
        </div>
      </div>

      {/* Grainient Background Matrix */}
      <div className="absolute inset-0 -z-10">
        <Grainient
          color1={colors.c1}
          color2={colors.c2}
          color3={colors.c3}
          timeSpeed={0.02}
          colorBalance={0}
          warpStrength={3.35}
          warpFrequency={5}
          warpSpeed={0}
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

      <LoadingOverlay isLoading={loading} />
      {/* {loading ? (
      ) : (
      )} */}
        <>
          <div className="relative mb-10 z-10 flex flex-col items-center h-full">
            {/* Section A: Head Coordinators Layout */}
            <div className="sm:w-[75%] w-full mt-20">
              <h1 className="text-white font-bold text-3xl sm:text-6xl text-center sm:mb-10">
                Head Coordinators
              </h1>
              <div className="flex flex-wrap justify-center gap-14 gap-y-6 mt-5">
                {roster.heads.map((person, i) => (
                  <div
                    key={i}
                    className="w-full lg:w-[22%] flex justify-center"
                  >
                    <ProfileCard
                      name={person.name}
                      title={person.title}
                      avatarUrl={person.avatar}
                      handle={person.instagramURL}
                      status="Online"
                      contactText="Contact"
                      showUserInfo={false}
                      enableTilt
                      behindGlowEnabled
                      behindGlowColor="hsla(353, 41%, 32%, 0.6)"
                      innerGradient="linear-gradient(145deg, hsla(353, 41%, 32%, 0.55) 0%, hsla(350, 21%, 66%, 0.45) 50%, hsla(352, 79%, 20%, 0.27) 100%)"
                      instagram={person.instagramURL}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Section B: Core Coordinators Layout */}
            <div className="w-[70%] sm:w-[80%] border-t-2 border-white/10 pt-8 mt-10 mb-20">
              <h1 className="text-white text-3xl sm:text-6xl text-center mb-7 sm:mb-10">
                Core Coordinators
              </h1>
              <div className="flex flex-wrap justify-center gap-y-20 gap-x-7">
                {roster.core.map((person, i) => (
                  <div
                    key={i}
                    className="relative h-75 w-full sm:w-[45%] lg:w-[22%] flex justify-center"
                  >
                    {person.instagramURL && (
                      <div
                        onClick={() =>
                          window.open(person.instagramURL, "_blank")
                        }
                        className="absolute z-10 top-2 right-2 cursor-pointer opacity-80 hover:opacity-100 transition-opacity bg-black/30 rounded-full p-2"
                      >
                        <InstagramIcon size={26} />
                      </div>
                    )}
                    <TiltedCard
                      imageSrc={person.image}
                      altText={person.title}
                      captionText={person.name}
                      containerHeight="350px"
                      containerWidth="100%"
                      imageHeight="350px"
                      rotateAmplitude={12}
                      scaleOnHover={1.05}
                      showMobileWarning={false}
                      showTooltip={false}
                      displayOverlayContent
                      overlayContent={
                        <p className="tilted-card-demo-text">{person.name}</p>
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Section C: Executives Grid */}
            {roster.exes.length > 0 && (
              <div className="w-[70%] sm:w-[80%] border-t-2 border-white/10 pt-8 mt-10 mb-20">
                <h1 className="text-white text-3xl sm:text-6xl text-center mb-7 sm:mb-10">
                  Executives
                </h1>
                <div className="flex flex-wrap justify-center gap-8">
                  {roster.exes.map((person, i) => (
                    <div
                      key={i}
                      className="w-full sm:w-[45%] lg:w-[22%] h-32.5 flex flex-col items-center justify-center rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 text-white"
                    >
                      <p className="text-lg sm:text-xl font-semibold">
                        {person.name}
                      </p>
                      <p className="text-sm sm:text-base text-white/70 mt-1">
                        {person.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section D: Functional Domains Lists */}
            {/* Only render the entire Domains section if at least one list has members */}
            {(roster?.management?.length > 0 ||
              roster?.anchoring?.length > 0) && (
              <div className="w-full sm:w-[80%] flex justify-center border-t border-white/10 pt-8 mt-10 mb-20">
                <div className="w-[80%] sm:w-full flex flex-col justify-center items-center">
                  <h1 className="text-white font-medium text-3xl sm:text-6xl text-center mb-10">
                    Domains
                  </h1>
                  <div className="flex flex-col gap-y-5 w-full sm:flex-row justify-evenly">
                    {/* Management Segment - Only renders if management array has items */}
                    {roster?.management?.length > 0 && (
                      <div>
                        <h2 className="text-white font-medium pb-2 border-b border-zinc-100 text-xl sm:text-3xl text-center mb-5">
                          Management
                        </h2>
                        <ul className="flex flex-col items-center gap-2 text-white/80 text-lg">
                          {roster.management.map((person, i) => (
                            <li key={i} className="px-4 py-1">
                              {person.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Anchoring Segment - Only renders if anchoring array has items */}
                    {roster?.anchoring?.length > 0 && (
                      <div>
                        <h2 className="text-white font-medium pb-2 border-b border-zinc-100 text-xl sm:text-3xl text-center mb-5">
                          Anchoring
                        </h2>
                        <ul className="flex flex-col items-center gap-2 text-white/80 text-lg">
                          {roster.anchoring.map((person, i) => (
                            <li key={i} className="px-4 py-1">
                              {person.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <GradualBlur
            target="page"
            position="bottom"
            height="5rem"
            strength={2}
            divCount={5}
            curve="bezier"
            exponential
            opacity={1}
            animated="scroll"
          />
        </>
    </div>
  );
}
