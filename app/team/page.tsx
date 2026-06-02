"use client";
import Grainient from "@/Reactbits/Grainient";
import ProfileCard from "@/Reactbits/ProfileCard";
import TiltedCard from "@/Reactbits/TiltedCard";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

type DbTeamMember = {
  name: string;
  role: string | null;
  domain: string;
  year: number;
  photo_url: string | null;
  instagram: string | null;
};
export default function Page() {
  const [heads, setHeads] = useState<any[]>([]);
  const [core, setCore] = useState<any[]>([]);
  const [exes, setExes] = useState<any[]>([]);
  const [management, setManagement] = useState<any[]>([]);
  const [anchoring, setAnchoring] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    async function loadTeamRoster() {
      try {
        setLoading(true);

        // Fetch active members from the database
        const { data, error } = await supabase
          .from("team_members")
          .select("name, role, domain, year, photo_url, instagram")
          .eq("is_active", true);

        if (error) throw error;

        if (data) {
          const members = data as DbTeamMember[];

          // 1. Map Heads (year = 4)
          setHeads(
            members
              .filter((m) => m.year === 4)
              .map((m) => ({
                name: m.name,
                title: m.role || "Head Coordinator",
                avatar: m.photo_url || "",
                instagramURL: m.instagram || "",
              })),
          );

          // 2. Map Core Team (year = 3)
         setCore(
  members
    .filter((m) => m.year === 3)
    .map((m) => ({
      ...m, // Spreads all original fields (id, email, phone_number, roll_number, branch, instagram, etc.)
      name: m.name,
      title: m.role || "Vocalist",
      image:
        m.photo_url ||
        "https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58",
    })),
);

          // 3. Map Executives (year = 2, domain = 'musician')
          setExes(
            members
              .filter((m) => m.year === 2 && m.domain === "musician")
              .map((m) => ({
                name: m.name,
                title: m.role || "Vocalist",
              })),
          );

          // 4. Map Management (domain = 'management')
          setManagement(
            members
              .filter((m) => m.domain === "management")
              .map((m) => ({
                name: m.name,
              })),
          );

          // 5. Map Anchoring (domain = 'anchoring')
          setAnchoring(
            members
              .filter((m) => m.domain === "anchoring")
              .map((m) => ({
                name: m.name,
              })),
          );
        }
      } catch (err) {
        console.error("Error fetching data from database:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTeamRoster();
  }, []);
  if (loading) {
    return (
      <div className="text-center py-12 text-sm text-gray-500">Loading...</div>
    );
  }
  console.log({ heads, core, exes, management, anchoring });
  const colors = { c1: "#722f37", c2: "#bd9398", c3: "#18022e" };
  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <div className="absolute sm:fixed left-14 top-0 sm:top-3 lg:top-5 sm:left-1/2 sm:-translate-x-1/2 z-50">
        <div className="flex">
          <img
            src="/svg-path.svg"
            className="hidden sm:block scale-x-[-1] h-9 w-auto max-h-full"
          />
          <div className="bg-black sm:rounded-bl-2xl rounded-br-2xl px-2 sm:px-4 pb-0 sm:pb-2 pl-4 sm:pl-4 ">
            <h1
              className="text-center font-bold text-2xl sm:text-4xl bg-gradient-to-br from-yellow-200 to-white
        bg-clip-text text-transparent drop-shadow-[0_8px_25px_rgba(0,0,0,0.9)]"
            >
              TEAM
            </h1>
          </div>
          <img src="/svg-path.svg" className="h-9 w-auto max-h-full" />
        </div>
      </div>

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
        />{" "}
      </div>
      <div className="relative mb-10 z-10 flex flex-col items-center h-full">
        <div className="sm:w-[75%] w-full mt-20">
          <h1 className="text-white font-medium text-3xl  sm:text-6xl text-center sm:mb-10">
            Head Coordinators
          </h1>

          <div className="flex flex-wrap justify-center gap-14 mt-5">
            {heads.map((person, i) => (
              <div key={i} className="w-full lg:w-[22%] flex justify-center">
                <ProfileCard
                  name={person.name}
                  title={person.title}
                  avatarUrl={person.avatar}
                  handle="shruti"
                  status="Online"
                  contactText="Contact"
                  showUserInfo={false}
                  enableTilt
                  enableMobileTilt
                  behindGlowColor="hsla(353, 41%, 32%, 0.6)"
                  iconUrl="/assets/demo/iconpattern.png"
                  behindGlowEnabled
                  innerGradient="linear-gradient(145deg, hsla(353, 41%, 32%, 0.55) 0%, hsla(350, 21%, 66%, 0.45) 50%, hsla(352, 79%, 20%, 0.27) 100%)"
                  instagram={person.instagramURL}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="w-[70%] sm:w-[80%] border-t-2 pt-8 mt-10 mb-20">
          <h1 className="text-white text-3xl sm:text-6xl text-center mb-7 sm:mb-10">
            Core Coordinators
          </h1>

          <div className="flex flex-wrap justify-center gap-y-20 gap-x-7">
            {core.map((person, i) => (
              <div
                key={i}
                className="relative h-[300px] w-full sm:w-[45%] lg:w-[22%] flex justify-center"
              >
                {person.instagram && (
                  <div
                    onClick={() => window.open(person.instagram, "_blank")}
                    className="absolute z-2 top-2 right-2 cursor-pointer opacity-80 hover:opacity-100 transition-opacity bg-black/30 rounded-full p-2"
                  >
                    <InstagramIcon size={26} />
                  </div>
                )}
                <TiltedCard
                  imageSrc={person.image}
                  altText={person.title}
                  captionText={person.name}
                  containerHeight="200px"
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
        <div className="w-[70%] sm:w-[80%] border-t-2 pt-8 mt-10 mb-20">
          <h1 className="text-white text-3xl sm:text-6xl text-center mb-7 sm:mb-10">
            Executives
          </h1>

          <div className="flex flex-wrap justify-center gap-8">
            {exes.map((person, i) => (
              <div
                key={i}
                className="w-full sm:w-[45%] lg:w-[22%] h-[130px] flex flex-col items-center justify-center rounded-2xl
      bg-white/10 backdrop-blur-lg border border-white/20 text-white"
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
        <div className="w-[100%] sm:w-[80%] flex justify-center border-t pt-8 mt-10 mb-20">
          <div className="w-[80%] sm:w-full flex flex-col justify-center items-center">
            <h1 className="text-white font-medium text-3xl sm:text-6xl text-center mb-10">
              Domains
            </h1>

            <div className="flex flex-col gap-y-5 w-full sm:flex-row justify-evenly">
              {/* Management */}
              <div>
                <h2 className="text-white font-medium pb-2 border-b-1 border-zinc-100 text-xl sm:text-3xl text-center mb-5">
                  Management
                </h2>

                <ul className="flex flex-col items-center gap-2 text-white/80 text-lg">
                  {management.map((person, i) => (
                    <li key={i} className="px-4 py-1">
                      {person.name}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Anchoring */}
              <div>
                <h2 className="text-white font-medium pb-2 border-b-1 border-zinc-100 text-xl sm:text-3xl text-center mb-5">
                  Anchoring
                </h2>

                <ul className="flex flex-col items-center gap-2 text-white/80 text-lg">
                  {anchoring.map((person, i) => (
                    <li key={i} className="px-4 py-1">
                      {person.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
