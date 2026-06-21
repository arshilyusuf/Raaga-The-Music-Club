import type { Metadata } from "next";
import "@/app/globals.css";
import localFont from "next/font/local";
import StaggeredMenu from "@/Reactbits/StaggeredMenu";
import ZoomWrapper from "@/components/ZoomWrapper";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";
import ClickSpark from "@/Reactbits/ClickSpark";
import Image from "next/image";
import GradualBlur from "@/Reactbits/GradualBlur";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const clashGrotesk = localFont({
  src: "../public/fonts/ClashGrotesk-Variable.ttf",
  variable: "--font-main",
});

export const metadata: Metadata = {
  title: "Raaga – The Music Club",
  description: "The official college music collective.",
};
const menuItems = [
  { label: "Home", ariaLabel: "Go to home page", link: "/" },
  { label: "auditions", ariaLabel: "Learn about us", link: "/auditions" },
  { label: "gallery", ariaLabel: "View our services", link: "/gallery" },
  { label: "team", ariaLabel: "Get in touch", link: "/team" },
];

const socialItems = [
  { label: "Instagram", link: "https://www.instagram.com/raaga.nitrr" },
  {
    label: "Youtube",
    link: "https://www.youtube.com/@raagathemusicclub",
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body
        className={`${clashGrotesk.className} antialiased bg-black cursor-pointer select-none overflow-hidden`}
      >
        <ClickSpark
          sparkColor="#fff"
          sparkSize={16}
          sparkRadius={15}
          sparkCount={8}
          duration={400}
        >
          <div className="relative min-h-screen w-screen">
            {/* Full-screen black background */}
            {/* <div className="absolute inset-0 bg-black z-0 touch-none" /> */}

            <div className="fixed overflow-y-auto overscroll-none no-scrollbar inset-2 sm:inset-3 md:inset-4 lg:inset-5 rounded-3xl z-10">
              <div className="relative flex min-h-full flex-col w-full bg-black text-zinc-50 rounded-3xl">
                {/* Top-left logo rectangle */}
                <div className="fixed top-0 left-1 sm:top-1 sm:left-0 lg:top-4 lg:left-4 z-20">
                  <div className="flex-col p-1">
                    <div className="flex">
                      <a href="/">
                        <div className="bg-black h-13 sm:h-13 w-16 sm:w-auto rounded-br-2xl p-2">
                          <Image
                            src="/pictures/Shruti26 Profile Picture-7.png"
                            className="h-full w-full object-contain"
                            width={64}
                            height={64}
                            alt="Raaga Logo"
                            priority
                          />
                        </div>
                      </a>
                      <img
                        src="/svg-path1.svg"
                        alt=""
                        aria-hidden="true"
                        className="h-8"
                      />
                    </div>
                    <img
                      src="/svg-path1.svg"
                      alt=""
                      aria-hidden="true"
                      className="h-8"
                    />
                  </div>
                </div>
                {/* <div className="relative flex p-3 px-4 rounded-br-2xl h-15 w-25 sm:h-15 sm:w-25 items-center justify-center bg-black">
                    <img
                      src="/pictures/Shruti26 Profile Picture-7.png"
                      className="h-full w-full object-contain"
                    />
                    <img
                      src="/svg-path.svg"
                      alt=""
                      aria-hidden="true"
                      className="pointer-events-none absolute sm:-right-6 -right-6 sm:top-[0.25rem] top-[0.45rem] h-6 w-6"
                    />
                    <img
                      src="/svg-path.svg"
                      alt=""
                      aria-hidden="true"
                      className="pointer-events-none absolute sm:left-1 left-[0.2rem] sm:-bottom-6 -bottom-[1.45rem] h-6 w-6"
                    />
                      </div> */}
                <div className="fixed inset-0 z-999 pointer-events-none">
                  <StaggeredMenu
                    position="right"
                    isFixed={true}
                    items={menuItems}
                    socialItems={socialItems}
                    displaySocials
                    menuButtonColor="#ffffff"
                    openMenuButtonColor="#9ebc16"
                    changeMenuColorOnOpen
                    colors={["#9ebc16", "#252e08"]}
                    accentColor="#9ebc16"
                  />
                </div>

                <div className="flex-1">
                  <ZoomWrapper>{children}</ZoomWrapper>
                </div>
                  
                <Footer />
              </div>
              
            </div>
            
          </div>

        </ClickSpark>
      </body>
    </html>
  );
}
