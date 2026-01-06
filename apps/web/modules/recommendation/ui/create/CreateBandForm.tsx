"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaFire,
  FaGuitar,
  FaHeart,
  FaLink,
  FaPlus,
  FaScroll,
  FaTags,
  FaTimes,
} from "react-icons/fa";
import TagEditor from "./TagEditor";
import MemberEditor from "./MemberEditor";
import { CreateBandDraft } from "../../domain/Catalog";

const inputBase =
  "w-full rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none " +
  "bg-gradient-to-br from-[#2d2d2d] to-[#1a1a1a] border-2 border-[#444] " +
  "focus:border-red-600 focus:shadow-[0_0_20px_rgba(220,38,38,0.30)] transition";

const cardBase =
  "rounded-lg border-2 border-[#333] " +
  "bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] " +
  "shadow-[0_8px_32px_rgba(220,38,38,0.20)]";

export default function CreateBandForm() {
  const router = useRouter();

  const [draft, setDraft] = useState<CreateBandDraft>({
    name: "",
    subgenres: [],
    moods: [],
    features: [],
    description: "",
    members: [{ name: "", role: "", period: "" }],
    spotify: "",
  });

  const canSubmit = useMemo(() => draft.name.trim().length > 0, [draft.name]);

  function patch(p: Partial<CreateBandDraft>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  function onCancel() {
    router.back();
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // UI-only (sin backend aún)
    const payload = {
      ...draft,
      members: draft.members.filter((m) => m.name.trim().length > 0),
    };

    console.log("[CreateBand] payload:", payload);
    alert("Band draft logged to console (UI only).");
  }

  return (
    <form onSubmit={onSubmit} className={`${cardBase} p-6 sm:p-8`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left */}
        <div className="space-y-6">
          <div>
            <label className="block text-red-400 font-bold mb-2 text-sm uppercase tracking-wider">
              <span className="inline-flex items-center gap-2">
                <FaGuitar /> Band Name
              </span>
            </label>
            <input
              value={draft.name}
              onChange={(e) => patch({ name: e.target.value })}
              className={inputBase}
              placeholder="Enter band name..."
              required
            />
          </div>

          <TagEditor
            label="Subgenres"
            icon={<FaTags />}
            placeholder="Add subgenre and press Enter..."
            values={draft.subgenres}
            onChange={(subgenres) => patch({ subgenres })}
          />

          <TagEditor
            label="Moods"
            icon={<FaHeart />}
            placeholder="Add mood and press Enter..."
            values={draft.moods}
            onChange={(moods) => patch({ moods })}
          />

          <TagEditor
            label="Musical Features"
            icon={<FaFire />}
            placeholder="Add feature and press Enter..."
            values={draft.features}
            onChange={(features) => patch({ features })}
          />

          <div>
            <label className="block text-red-400 font-bold mb-2 text-sm uppercase tracking-wider">
              <span className="inline-flex items-center gap-2">
                <FaScroll /> Description
              </span>
            </label>
            <textarea
              value={draft.description}
              onChange={(e) => patch({ description: e.target.value })}
              className={`${inputBase} h-32 resize-none`}
              placeholder="Describe the band's style, history, and characteristics..."
            />
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6">
          <MemberEditor
            value={draft.members}
            onChange={(members) => patch({ members })}
          />

          <div>
            <label className="block text-red-400 font-bold mb-2 text-sm uppercase tracking-wider">
              <span className="inline-flex items-center gap-2">
                <FaLink /> Spotify Link
              </span>
            </label>

            <input
              value={draft.spotify}
              onChange={(e) => patch({ spotify: e.target.value })}
              type="url"
              className={inputBase}
              placeholder="https://open.spotify.com/artist/..."
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 pt-6 border-t border-gray-700 flex justify-center gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-lg px-8 py-3 font-bold
                     bg-gray-700 hover:bg-gray-600 transition-colors"
        >
          <FaTimes />
          Cancel
        </button>

        <button
          type="submit"
          disabled={!canSubmit}
          className={[
            "inline-flex items-center gap-2 rounded-lg px-8 py-3 font-bold",
            "bg-gradient-to-br from-red-600 to-red-800",
            "shadow-[0_4px_15px_rgba(220,38,38,0.40)] transition",
            "hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(220,38,38,0.60)]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
          ].join(" ")}
        >
          <FaPlus />
          Create Band
        </button>
      </div>
    </form>
  );
}
