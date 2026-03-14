import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import StaggeredMenu from "@/Reactbits/StaggeredMenu";
import ZoomWrapper from "@/components/ZoomWrapper";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";

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
  { label: "Instagram", link: "https://twitter.com" },
  { label: "Youtube", link: "https://github.com" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${clashGrotesk.className} antialiased bg-black`}>
        <div className="relative min-h-screen w-screen">
          {/* Full-screen black background */}
          <div className="absolute inset-0 bg-black z-0" />

          <div className="absolute overflow-y-auto no-scrollbar inset-2 sm:inset-3 md:inset-4 lg:inset-5 rounded-3xl z-10">
            <div className="relative min-h-full w-full bg-black text-zinc-50 rounded-3xl">
              {/* Top-left logo rectangle */}
              <div className="fixed top-4 left-4 sm:top-5 sm:left-4 z-20">
                <div className="relative flex p-2 px-4 rounded-br-2xl h-15 w-25 sm:h-15 sm:w-25 items-center justify-center bg-black">
                  <img
                    src="/pictures/Shruti26 Profile Picture-7.png"
                    className="h-full w-full object-contain"
                  />
                  <img
                    src="/svg-path.svg"
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-6 top-0 h-6 w-6 "
                  />
                  <img
                    src="/svg-path.svg"
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1 -bottom-6 h-6 w-6 "
                  />
                </div>
              </div>
              <div className="fixed inset-0 z-999 pointer-events-none">
                <StaggeredMenu
                  position="right"
                  isFixed={false}
                  items={menuItems}
                  socialItems={socialItems}
                  displaySocials
                  menuButtonColor="#ffffff"
                  openMenuButtonColor="#b12f2f"
                  changeMenuColorOnOpen
                  colors={["#e31616", "#721d1d"]}
                  accentColor="#b12f2f"
                />
              </div>

              <div className="relative z-10 min-h-screen">
                <ZoomWrapper>{children}</ZoomWrapper>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
