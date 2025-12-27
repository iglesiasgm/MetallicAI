import Image from "next/image";

import {
  FaBolt,
  FaCrown,
  FaFireAlt,
  FaMoon,
  FaRadiation,
  FaUsers,
} from "react-icons/fa";
import { Band } from "../../domain/Catalog";

function pickIcon(band: Band) {
  const moods = (band.moods ?? []).map((m) => m.toLowerCase());
  const subs = (band.subgenres ?? []).map((s) => s.toLowerCase());

  if (moods.some((m) => m.includes("satan")))
    return <FaFireAlt className="text-red-500 text-xl" />;
  if (subs.some((s) => s.includes("doom")))
    return <FaMoon className="text-purple-400 text-xl" />;
  if (moods.some((m) => m.includes("war") || m.includes("politic")))
    return <FaRadiation className="text-green-400 text-xl" />;
  if (subs.some((s) => s.includes("thrash")))
    return <FaBolt className="text-yellow-400 text-xl" />;
  return <FaCrown className="text-yellow-500 text-xl" />;
}

export default function BandCard({
  band,
  metalFont,
}: {
  band: Band;
  metalFont: string;
}) {
  const topMembers = (band.members ?? []).slice(0, 4);
  const genre = band.subgenres?.[0] ?? "Metal";
  const moods = (band.moods ?? []).slice(0, 3);

  return (
    <div
      className="
        rounded-lg p-6
        border border-red-900/70
        bg-gradient-to-br from-gray-900/90 to-black/90
        shadow-[0_0_20px_rgba(220,38,38,0.25),0_0_40px_rgba(220,38,38,0.15)]
        transition-all duration-300
        hover:-translate-y-2 hover:scale-[1.02]
        hover:shadow-[0_20px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(220,38,38,0.35)]
      "
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className={[
            "text-2xl font-bold text-red-400 uppercase",
            metalFont,
          ].join(" ")}
        >
          {band.name}
        </h3>
        {pickIcon(band)}
      </div>

      <div className="h-48 overflow-hidden mb-4 rounded-lg">
        <Image
          src="/placeholder.jpg"
          alt={`${band.name} placeholder`}
          width={800}
          height={500}
          className="w-full h-full object-cover"
          priority={false}
        />
      </div>

      <p className="text-gray-300 text-sm mb-4 leading-relaxed line-clamp-3">
        {band.description}
      </p>

      <div className="mb-4">
        <h4
          className={["text-red-400 font-semibold mb-2", metalFont].join(" ")}
        >
          <FaUsers className="inline-block mr-2" />
          Members:
        </h4>
        <div className="flex flex-wrap gap-2">
          {topMembers.map((m) => (
            <span
              key={`${band.id}-${m.name}`}
              className="bg-gray-800/80 text-gray-300 px-2 py-1 rounded text-xs"
              title={`${m.role} · ${m.period}`}
            >
              {m.name}
            </span>
          ))}
          {band.members?.length > 4 && (
            <span className="bg-gray-800/60 text-gray-400 px-2 py-1 rounded text-xs">
              +{band.members.length - 4} more
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <span className="text-xs text-gray-400 mb-1 block">GENRE:</span>
          <span className="bg-red-900/80 text-red-200 px-3 py-1 rounded-full text-xs font-semibold">
            {genre}
          </span>
        </div>

        <div>
          <span className="text-xs text-gray-400 mb-1 block">MOODS:</span>
          <div className="flex flex-wrap gap-1">
            {moods.map((m) => (
              <span
                key={`${band.id}-${m}`}
                className="bg-orange-900/60 text-orange-200 px-2 py-1 rounded text-xs"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
