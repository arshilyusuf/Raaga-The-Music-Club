import TextType from "@/Reactbits/TextType";
import Image from "next/image"; // optional if you want next/image optimization
import UntitledImage from "@/public/pictures/Untitled.png";
import { motion } from "framer-motion";
import Button from "./Button";
import { useRouter } from "next/navigation";
export default function Section2() {
  const router = useRouter();
  const goToTeam = () => {
    router.push("/team");
  };
  return (
    <section
      className="flex flex-col h-screen justify-center items-center w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${UntitledImage.src})` }}
    >
      <div className="flex flex-col py-5  justify-center items-center max-w-4xl px-4 p-8 rounded">
        <TextType
          text={["Ready to Make Your Music Heard?"]}
          typingSpeed={45}
          deletingSpeed={50}
          pauseDuration={3200}
          showCursor
          className="text-5xl font-semibold mb-8 text-white text-center"
          cursorCharacter="|"
          cursorBlinkDuration={1.1}
          variableSpeed={{ min: 60, max: 140 }}
        />
        <motion.p
          className="text-2xl mb-10 text-white text-center"
          initial={{ opacity: 0, y: 40 }} // start slightly below and invisible
          whileInView={{ opacity: 1, y: 0 }} // animate when it enters viewport
          viewport={{ once: false, amount: 0.8 }} // trigger once when 50% visible
          transition={{ duration: 1, ease: "easeOut" }} // smooth animation
        >
          Joining <span className="font-semibold">Raaga</span> is your chance to
          be part of a vibrant community of musicians and performers. Every
          year, we hold auditions in August to discover new talent and welcome
          passionate artists into our club.
        </motion.p>
        <motion.p
          className="text-2xl sm:w-1/3 w-full text-white text-center"
          initial={{ opacity: 0, y: 40 }} // start slightly below and invisible
          whileInView={{ opacity: 1, y: 0 }} // animate when it enters viewport
          viewport={{ once: false, amount: 0.8 }} // trigger once when 50% visible
          transition={{ duration: 1, ease: "easeOut" }} // smooth animation
        >
          <Button text="Meet our Team" onClick={goToTeam} />
        </motion.p>
      </div>
    </section>
  );
}
