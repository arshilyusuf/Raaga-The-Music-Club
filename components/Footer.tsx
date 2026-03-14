import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative bg-black text-white w-full py-16 pb-2 px-6 overflow-hidden">
      {/* Left inverted border */}
      <Image
        src="/svg-path.svg"
        alt=""
        width={24}
        height={24}
        className="absolute z-100 sm:-top-6 -top-[1.45rem] left-0 rotate-[270deg] pointer-events-none"
      />

      {/* Right inverted border */}
      <Image
        src="/svg-path.svg"
        alt=""
        width={24}
        height={24}
        className="absolute z-100 sm:-top-6 -top-[1.45rem] sm:right-0 -right-[0.1rem] rotate-180 pointer-events-none"
      />

      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
        {/* Logo + slogan */}
        <div className="flex flex-col">
          <Image
            src="/pictures/Shruti26 Profile Picture-7.png"
            alt="Raaga Logo"
            width={128}
            height={128}
            className="w-32 mb-5 h-auto"
          />
          <p className="text-lg text-gray-300">
            Where melody meets passion and performers find their stage.
          </p>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Connect With Us</h3>
          <div className="flex flex-col gap-3 text-gray-300">
            <a href="#" className="hover:text-white transition">
              Instagram
            </a>
            <a href="#" className="hover:text-white transition">
              YouTube
            </a>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Contact</h3>
          <div className="flex flex-col gap-2 text-gray-300">
            <p>xyz@gmail.com</p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-12 pt-6 border-t border-gray-800 text-center text-gray-400">
        <p>Made by Raaga The Music Club</p>
      </div>
    </footer>
  );
}
