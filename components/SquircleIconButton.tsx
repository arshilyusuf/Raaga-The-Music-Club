import React, { ReactNode } from "react";

type ButtonSize = "sm" | "md" | "lg";

type SquircleIconButtonProps = {
  icon: ReactNode;
  label: string;
  // Updated to accept the standard React click event parameter
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  bgColor?: string;
  size?: ButtonSize;
  disabled?: boolean;
};

export function SquircleIconButton({
  icon,
  label,
  onClick,
  bgColor = "",
  size = "md",
  disabled = false,
}: SquircleIconButtonProps) {
  
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return (
    <div className="relative  flex flex-col items-center group">
      <button
        onClick={onClick} // Passes the event object up cleanly now
        disabled={disabled}
        style={{ clipPath: `url(#squircle-clip)` }}
        className={`flex items-center justify-center text-white font-medium transition duration-300 ease-in-out select-none active:scale-95 disabled:opacity-50 disabled:pointer-events-none  ${sizeClasses[size]} ${bgColor}`}
      >
        {icon}
      </button>

      <span className="absolute bottom-full mb-2 z-100 scale-90 opacity-0 pointer-events-none transition-all duration-300 ease-out translate-y-2 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 bg-gray-950/90 text-gray-200 text-xs font-medium px-2.5 py-1.5 rounded-md border border-gray-800 backdrop-blur-sm shadow-xl whitespace-nowrap">
        {label}
      </span>

      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <clipPath id="squircle-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0,0.5 C 0,0.05 0.05,0 0.5,0 C 0.95,0 1,0.05 1,0.5 C 1,0.95 0.95,1 0.5,1 C 0.05,1 0,0.95 0,0.5" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}