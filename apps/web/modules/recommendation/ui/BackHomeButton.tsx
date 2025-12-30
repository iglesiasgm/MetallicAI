"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";

export default function BackHomeButton() {
  return (
    <motion.div
      className="absolute left-6 top-6 z-20"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Link href="/" aria-label="Volver al inicio" title="Home">
        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.96 }}
          className="
            h-12 w-12
            rounded-full
            flex items-center justify-center
            border border-white/10
            bg-black/55
            backdrop-blur-md
            shadow-2xl
            text-red-700
            hover:text-red-500
            transition
          "
        >
          <FaArrowLeft className="text-lg" />
        </motion.div>
      </Link>
    </motion.div>
  );
}
