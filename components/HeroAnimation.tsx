"use client";

import { motion } from "framer-motion";

export default function HeroAnimation() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="text-center py-16"
    >
      <p className="text-gray-400 text-lg">
        Experience a new way to earn from your airtime usage.
      </p>
    </motion.section>
  );
}
