"use client";
import{ XIcon} from "./ui/x"
type ImagePopupProps = {
  src: string | null;
  onClose: () => void;
};

export default function ImagePopup({ src, onClose }: ImagePopupProps) {
  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative inline-block"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          className="max-h-[92vh] max-w-[90vw] object-contain block"
        />

        <button
          className="absolute top-3 right-3
          flex items-center justify-center w-10 h-10
          rounded-full bg-black/40 backdrop-blur-md text-white text-2xl
          hover:bg-black/60 hover:scale-110 active:scale-95
          transition-all duration-200 ease-out"
          onClick={onClose}
        >
          <XIcon/>
        </button>
      </div>
    </div>
  );
}