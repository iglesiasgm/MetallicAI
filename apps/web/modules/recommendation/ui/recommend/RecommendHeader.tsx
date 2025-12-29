"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaCompactDisc, FaFire, FaSkull, FaUser } from "react-icons/fa";
import { FaHouse } from "react-icons/fa6";

export default function RecommendHeader() {
  return (
    <header className="border-b border-red-900/30 bg-black/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="relative h-10 w-10">
            <Image
              src="/icon.png" // <-- CAMBIAR a tu logo real
              alt="MetallicAI Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-gray-300 hover:text-red-600 transition-colors flex items-center gap-2"
          >
            <FaHouse />
            <span className="font-medium">Home</span>
          </Link>

          {/* Mock links */}
          <button
            type="button"
            className="text-gray-300 hover:text-red-600 transition-colors flex items-center gap-2"
          >
            <FaFire />
            <span className="font-medium">Trending</span>
          </button>

          <button
            type="button"
            className="text-gray-300 hover:text-red-600 transition-colors flex items-center gap-2"
          >
            <FaCompactDisc />
            <span className="font-medium">History</span>
          </button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            className="
              bg-red-600 hover:bg-red-700
              px-6 py-2 rounded font-bold
              transition-all
              shadow-[0_0_15px_rgba(220,38,38,0.5),inset_0_0_15px_rgba(0,0,0,0.5)]
            "
          >
            <FaUser className="inline-block mr-2" />
            Sign In
          </motion.button>
        </nav>
      </div>
    </header>
  );
}
