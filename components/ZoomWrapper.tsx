"use client";
import { motion } from "framer-motion";
import React from "react";

export default function ZoomWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ scale: 1.15, opacity: 0.7 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 90, damping: 20 }}
      className="relative z-10 min-h-full"
    >
      {children}
    </motion.div>
  );
}