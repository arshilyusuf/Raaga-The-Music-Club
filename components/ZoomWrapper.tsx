"use client";
import { motion } from "framer-motion";
import React from "react";

export default function ZoomWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ scale: 1.1, opacity: 0.1 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 50, damping: 20 }}
      className="relative z-10 min-h-full"
    >
      {children}
    </motion.div>
  );
}