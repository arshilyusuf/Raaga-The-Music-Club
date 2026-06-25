import React, { useState, useEffect } from "react";
import Strands from "@/Reactbits/Strands";

export interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message }: LoadingOverlayProps) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/75 backdrop-blur-sm`}
    >
      {message && (
        <div className="relative z-10 text-white font-medium tracking-wide text-lg text-center bg-black/50 px-4 py-2 rounded">
          {message}
        </div>
      )}
    </div>
  );
}
