import ColorBends from "@/Reactbits/ColorBends";
import ProfileCard from "@/Reactbits/ProfileCard";
import TiltedCard from "@/Reactbits/TiltedCard";

export default function Page() {
  const heads = [
    {
      name: "Arshil Yusuf",
      title: "Instrumentalist",
      avatar: "/pictures/Untitled (1).png",
    },
    {
      name: "Siddharth Phatak",
      title: "Vocalist",
      avatar: "/team/siddharth.jpg",
    },
    {
      name: "Tanishq Roy Chowdhary",
      title: "Head Coordinator",
      avatar: "/team/john.jpg",
    },
    { name: "Jane Smith", title: "Head Coordinator", avatar: "/team/jane.jpg" },
    {
      name: "Alex Carter",
      title: "Head Coordinator",
      avatar: "/team/alex.jpg",
    },
    { name: "Sara Khan", title: "Head Coordinator", avatar: "/team/sara.jpg" },
  ];

  const core = [
    {
      name: "Satyam Trivedi",
      title: "Vocalist",
      image: "https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58",
    },
    {
      name: "Tyler Durden",
      title: "Voalist",

      image: "https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58",
    },
    {
      name: "Naman Ahuja",
      title: "Instrumentalist",

      image: "https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58",
    },
    {
      name: "Frank Ocean",
      title: "Voalist",

      image: "https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58",
    },
    {
      name: "Daniel Caesar",
      title: "Voalist",

      image: "https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58",
    },
    {
      name: "Steve Lacy",
      title: "Voalist",

      image: "https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58",
    },
  ];

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <div className="fixed bottom-0 left-[0.1rem] sm:top-5 sm:left-1/2 sm:-translate-x-1/2 z-50">
        <div
          className="relative w-fit bg-black 
                rounded-tr-2xl sm:rounded-tr-none 
                sm:rounded-bl-2xl sm:rounded-br-2xl 
                px-4 pb-2 sm:pt-0 pt-2"
        >
          <img
            src="/svg-path.svg"
            className="absolute sm:left-[0.5] bottom-[0.45rem] left-[8.1rem] sm:top-0 h-6 w-auto -translate-x-full rotate-270 sm:rotate-90"
          />

          <h1
            className="text-center font-bold text-2xl sm:text-4xl bg-gradient-to-br from-yellow-200 to-white
                 bg-clip-text text-transparent drop-shadow-[0_8px_25px_rgba(0,0,0,0.9)]"
          >
            TEAM
          </h1>

          <img
            src="/svg-path.svg"
            className="absolute right-[6.4rem] sm:right-[0.5] sm:top-0 -top-[1.45rem] h-6 w-auto translate-x-full sm:rotate-0 -rotate-90"
          />
        </div>
      </div>

      <div className="absolute inset-0 -z-10">
        <ColorBends
          colors={["#722f37", "#bd9398", "#5b0b14"]}
          rotation={0}
          speed={0.2}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          parallax={0.5}
          noise={0.1}
          transparent
          autoRotate={0}
        />
      </div>

      <div className="relative mb-10 z-10 flex flex-col items-center h-full">
        <div className="sm:w-[75%] w-[90%] mt-20">
          <h1 className="text-white font-medium text-3xl  sm:text-6xl text-center mb-5 sm:mb-10">
            Head Coordinators
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 justify-items-center">
            {heads.map((person, i) => (
              <ProfileCard
                key={i}
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
              />
            ))}
          </div>
        </div>
        <div className="w-[80%] border-t-2 pt-8 mt-24">
          <h1 className="text-white text-3xl sm:text-6xl text-center mb-7 sm:mb-10">
            Core Coordinators
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-10 justify-items-center">
            {core.map((person, i) => (
              <div key={i} className="relative sm:w-[300px] h-[400px]">
                <TiltedCard
                  imageSrc={person.image}
                  altText={person.title}
                  captionText={person.name}
                  containerHeight="300px"
                  containerWidth="300px"
                  imageHeight="400px"
                  imageWidth="350px"
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
      </div>
    </div>
  );
}
