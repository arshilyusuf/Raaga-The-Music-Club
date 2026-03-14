"use client";
import React from "react";
import { ArrowUpRightIcon } from "./ui/arrow-up-right";

interface ButtonProps {
  onClick: () => void;
  color?: string;
  text: string;
}

const Button: React.FC<ButtonProps> = ({ onClick = () => {}, color = "#ffffff", text = "Button" }) => {
  return (
   <button
      onClick={onClick}
      className="mt-6 flex items-center gap-3 justify-center w-full border py-3 font-semibold transition-colors duration-300"
      style={{
        borderColor: color,
        color: color,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = color;
        e.currentTarget.style.color = "#000000";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.color = color;
      }}
    >
      {text}<ArrowUpRightIcon size={20}/>
    </button>
  );
};

export default Button;