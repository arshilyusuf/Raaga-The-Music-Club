import Image from "next/image";

export default function AboutPage() {
  return (
    <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 pt-0">
      {/* Background Image Container */}
      <div className="absolute inset-0 -z-10">
        {/* Desktop Background */}
        <Image
          src="/pictures/Raaga26BGG.png"
          alt="Main Background Desktop"
          fill
          sizes="100vw"
          className="hidden md:block"
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
          quality={70}
          draggable={false}
        />
        {/* Mobile Background */}
        <Image
          src="/pictures/Raaga26BGMobile.png"
          alt="Main Background Mobile"
          fill
          sizes="100vw"
          className="md:hidden block"
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
          quality={70}
          draggable={false}
        />
      </div>

      {/* Main Content Container */}
      <div className="flex flex-col w-full max-w-4xl items-center gap-4 md:gap-6 justify-start text-center text-white z-10">
        {/* Logo/Image: object-contain prevents smooshing */}
        <div className="relative w-[150px] h-[150px] md:w-[200px] md:h-[200px]">
          <Image
            src="/pictures/Shruti26 Profile Picture-11.png"
            alt="Shruti Profile Picture"
            fill
            className="object-contain"
            draggable={false}
          />
        </div>

        <h2 className="text-3xl md:text-5xl font-bold">ABOUT US</h2>

        {/* Faculty Container */}
        <div className="pt-4 md:pt-8 border-t border-white/20 w-full px-4">
          <p className="text-sm md:text-lg font-semibold text-white mb-3">
            Current Faculties In-Charge:
          </p>
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            <span className="text-[#c2ff99] bg-black/20 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-full font-bold text-sm md:text-base">
              Dr. Dibakar Saha
            </span>
            <span className="text-[#c2ff99] bg-black/20 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-full font-bold text-sm md:text-base">
              Dr. Mridu Sahu
            </span>
          </div>
        </div>

        {/* Glassmorphism Container */}
        <div className="w-[95%] md:w-full p-6 md:p-8 rounded-2xl md:rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
          <p className="text-base md:text-xl leading-relaxed font-medium text-white text-justify">
            NIT Raipur's music club, RAAGA, was started in 2009 through the
            collective enthusiasm of students, the Director, and the Dean
            Students' Welfare. It has been working continuously since then and
            has been successful in its aim which is to provide a platform to the
            students who are interested in music. With the beginning of each
            session, a large number of music lovers apply for being a part of
            the club. Team Raaga gives its contribution in every cultural
            activity of the college. Whether it is the Independence Day,
            Republic day or the Alumni-meet, Team is always prepared to play its
            part. Raaga is well known for their mesmerising performance each and
            every year in Cultural Night of Eclectika, Aavartan organized by
            Technocracy, E-summit organized by E-cell, Avinya organized by
            I-cell and many more.
          </p>
        </div>
      </div>

      {/* Gradients */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 md:h-64 bg-linear-to-b from-[#242d06] from-10% to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 md:h-64 bg-linear-to-t from-[#242d06] to-transparent" />
    </section>
  );
}
