import Event from "@/components/Event";
import Footer from "@/components/Footer";
import Grainient from "@/Reactbits/Grainient";

export default function Page() {
  const items = [
    {
      id: "1",
      img: "https://picsum.photos/id/1015/600/900?grayscale",
      url: "https://example.com/1",
      height: 400,
    },
    {
      id: "2",
      img: "https://picsum.photos/id/1011/600/750?grayscale",
      url: "https://example.com/2",
      height: 250,
    },
    {
      id: "3",
      img: "https://picsum.photos/id/1020/600/800?grayscale",
      url: "https://example.com/3",
      height: 600,
    },
    {
      id: "4",
      img: "https://picsum.photos/id/1035/600/850?grayscale",
      url: "https://example.com/4",
      height: 500,
    },
    {
      id: "5",
      img: "https://picsum.photos/id/1041/600/700?grayscale",
      url: "https://example.com/5",
      height: 300,
    },
    {
      id: "6",
      img: "https://picsum.photos/id/1050/600/900?grayscale",
      url: "https://example.com/6",
      height: 450,
    },
    {
      id: "7",
      img: "https://picsum.photos/id/1060/600/750?grayscale",
      url: "https://example.com/7",
      height: 350,
    },
    {
      id: "8",
      img: "https://picsum.photos/id/1074/600/820?grayscale",
      url: "https://example.com/8",
      height: 550,
    },
    {
      id: "9",
      img: "https://picsum.photos/id/1084/600/900?grayscale",
      url: "https://example.com/9",
      height: 480,
    },
    {
      id: "10",
      img: "https://picsum.photos/id/1080/600/760?grayscale",
      url: "https://example.com/10",
      height: 320,
    },
    {
      id: "11",
      img: "https://picsum.photos/id/109/600/800?grayscale",
      url: "https://example.com/11",
      height: 600,
    },
    {
      id: "12",
      img: "https://picsum.photos/id/110/600/850?grayscale",
      url: "https://example.com/12",
      height: 420,
    },
    {
      id: "13",
      img: "https://picsum.photos/id/111/600/900?grayscale",
      url: "https://example.com/13",
      height: 470,
    },
    {
      id: "14",
      img: "https://picsum.photos/id/112/600/780?grayscale",
      url: "https://example.com/14",
      height: 360,
    },
    {
      id: "15",
      img: "https://picsum.photos/id/113/600/840?grayscale",
      url: "https://example.com/15",
      height: 510,
    },
    {
      id: "16",
      img: "https://picsum.photos/id/114/600/920?grayscale",
      url: "https://example.com/16",
      height: 580,
    },
    {
      id: "17",
      img: "https://picsum.photos/id/115/600/760?grayscale",
      url: "https://example.com/17",
      height: 340,
    },
    {
      id: "18",
      img: "https://picsum.photos/id/116/600/810?grayscale",
      url: "https://example.com/18",
      height: 440,
    },
    {
      id: "19",
      img: "https://picsum.photos/id/117/600/870?grayscale",
      url: "https://example.com/19",
      height: 520,
    },
    {
      id: "20",
      img: "https://picsum.photos/id/118/600/790?grayscale",
      url: "https://example.com/20",
      height: 380,
    },
  ];

  return (
    <div className="relative flex flex-col justify-center w-full min-h-full">
      <div className="absolute sm:fixed left-18 top-0 sm:top-3 lg:top-5  sm:left-1/2 sm:-translate-x-1/2 z-50">
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
              GALLERY
            </h1>
          </div>
          <img src="/svg-path.svg" className="h-9 w-auto max-h-full" />
        </div>
      </div>
      {/* <div className="fixed bottom-0 left-[6rem] sm:top-5 top-0 sm:left-1/2 sm:-translate-x-1/2 z-50">
        <div
          className="relative w-fit bg-black 
                sm:rounded-tr-none 
                sm:rounded-bl-2xl rounded-br-2xl 
                px-4 pb-2 sm:pt-0 pt-2"
        >
          <img
            src="/svg-path.svg"
            className="absolute sm:left-[0.5] bottom-3 left-[12rem] sm:top-0 h-9 w-auto -translate-x-full sm:rotate-90"
          />

          <h1
            className="text-center font-bold text-2xl sm:text-4xl bg-gradient-to-br from-yellow-200 to-white
                 bg-clip-text text-transparent drop-shadow-[0_8px_25px_rgba(0,0,0,0.9)]"
          >
            GALLERY
          </h1>

          <img
            src="/svg-path.svg"
            className="absolute right-37 sm:right-[0.5] sm:top-0 -top-[1.45rem] h-6 w-auto translate-x-full sm:rotate-0 -rotate-90"
          />
        </div>
      </div> */}

      <div className="absolute inset-0 -z-10">
        <Grainient
          color1="#722f37"
          color2="#bd9398"
          color3="#5b0b14"
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
        />
      </div>
      <div className="mt-10">
        <div className="mb-5 border-b border-zinc-50">
          <Event eventName="Shruti'25" date="January 9, 2026" items={items} />
        </div>
        <div className="mb-5 border-b border-zinc-50">
          <Event eventName="Shruti'24" date="November 13, 2024" items={items} />
        </div>
        <div className="">
          <Event eventName="Shruti'23" date="October 12, 2023" items={items} />
        </div>
      </div>
    </div>
  );
}
