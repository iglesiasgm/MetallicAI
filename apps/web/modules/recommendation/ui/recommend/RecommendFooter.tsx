"use client";

import {
  FaDiscord,
  FaSkull,
  FaSpotify,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

export default function RecommendFooter() {
  return (
    <footer className="border-t border-red-900/30 bg-black/15 backdrop-blur-sm py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaSkull className="text-red-600 text-2xl" />
            <span className="text-gray-400 text-sm">
              © 2026 MetallicAI. Todos los derechos reservados.
            </span>
          </div>

          {/* links mock */}
          <div className="flex items-center gap-6">
            <button
              className="text-gray-400 hover:text-red-600 transition-colors"
              type="button"
            >
              <FaSpotify className="text-xl" />
            </button>
            <button
              className="text-gray-400 hover:text-red-600 transition-colors"
              type="button"
            >
              <FaYoutube className="text-xl" />
            </button>
            <button
              className="text-gray-400 hover:text-red-600 transition-colors"
              type="button"
            >
              <FaDiscord className="text-xl" />
            </button>
            <button
              className="text-gray-400 hover:text-red-600 transition-colors"
              type="button"
            >
              <FaTwitter className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
