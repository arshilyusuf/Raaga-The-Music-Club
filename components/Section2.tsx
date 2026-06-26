import TextType from "@/Reactbits/TextType";
import Image from "next/image"; // optional if you want next/image optimization
import UntitledImage from "@/public/pictures/Section2BG.png";
import { motion } from "framer-motion";
import Button from "./Button";
import { useRouter } from "next/navigation";
import Strands from "@/Reactbits/Strands";
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
      <div className="flex flex-col py-5  justify-center items-center max-w-4xl sm:px-4 p-8 rounded">
        <TextType
          text={["Find your voice, join our symphony!"]}
          typingSpeed={45}
          deletingSpeed={50}
          pauseDuration={3200}
          showCursor
          className="text-4xl sm:text-5xl font-semibold mb-8 text-white text-center"
          cursorCharacter="|"
          cursorBlinkDuration={1.1}
          variableSpeed={{ min: 60, max: 140 }}
        />
        <motion.p
          className="text-xl sm:text-2xl mb-5 text-white text-center"
          initial={{ opacity: 0, y: 40 }} // start slightly below and invisible
          whileInView={{ opacity: 1, y: 0 }} // animate when it enters viewport
          viewport={{ once: true, amount: 0.8 }} // trigger once when 50% visible
          transition={{ duration: 1, ease: "easeOut" }} // smooth animation
        >
          Joining <span className="font-semibold">Raaga</span> is your chance to
          be part of a vibrant community of musicians and performers among NIT
          Raipur. Every year, we hold auditions in August to discover new talent
          and welcome passionate artists into our club.
        </motion.p>
        <motion.div
          className="flex items-center justify-center text-center  gap-2 text-white/90 text-sm sm:text-base"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full shrink-0 text-black bg-white backdrop-blur-sm text-xs">
            i
          </span>
          <span>
            Auditions are also taken for{" "}
            {/* <span className="font-semibold">Management</span> and{" "} */}
            <span className="font-semibold">Anchoring</span> domains.
          </span>
        </motion.div>
        <motion.p
          className="text-2xl w-full sm:w-1/4 lg:w-1/2 text-white text-center"
          initial={{ opacity: 0, y: 40 }} // start slightly below and invisible
          whileInView={{ opacity: 1, y: 0 }} // animate when it enters viewport
          viewport={{ once: true, amount: 0.8 }} // trigger once when 50% visible
          transition={{ duration: 1, ease: "easeOut" }} // smooth animation
        >
          <Button text="Meet our Team" onClick={goToTeam} />
        </motion.p>
      </div>
      
    </section>
  );
}
