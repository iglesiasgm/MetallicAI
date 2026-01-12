import Image from "next/image";

import {
  FaBolt,
  FaCrown,
  FaEye,
  FaFireAlt,
  FaMoon,
  FaRadiation,
  FaSpotify,
  FaUsers,
  FaYoutube,
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
  onDetails,
}: {
  band: Band;
  metalFont: string;
  onDetails: (id: string) => void;
}) {
  const topMembers = (band.members ?? []).slice(0, 4);
  const genre = band.subgenres?.[0] ?? "Metal";
  const moods = (band.moods ?? []).slice(0, 3);
  const linksArr = Array.isArray(band.links)
    ? band.links
    : band.links
    ? [band.links]
    : [];

  const spotify = linksArr.find((l) => l?.spotify?.trim())?.spotify;
  const youtube = linksArr.find((l) => l?.youtube?.trim())?.youtube;

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
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="min-w-0">
          <h3
            className={[
              "text-2xl font-bold text-red-400 uppercase truncate",
              metalFont,
            ].join(" ")}
          >
            {band.name}
          </h3>
        </div>

        {/* derecha: links + icono dinámico */}
        <div className="flex items-center gap-3 shrink-0">
          {/* links horizontales */}
          <div className="flex items-center gap-3">
            {youtube && (
              <a
                href={youtube}
                target="_blank"
                rel="noreferrer"
                title="Abrir en YouTube"
                className="text-red-500 hover:text-red-400 transition"
              >
                <FaYoutube className="text-2xl" />
              </a>
            )}

            {spotify && (
              <a
                href={spotify}
                target="_blank"
                rel="noreferrer"
                title="Abrir en Spotify"
                className="text-green-500 hover:text-green-400 transition"
              >
                <FaSpotify className="text-2xl" />
              </a>
            )}
          </div>

          {/* icono dinámico (rayito, corona, etc.) */}
          {pickIcon(band)}
        </div>
      </div>

      <div className="h-48 overflow-hidden mb-4 rounded-lg">
        <img
          src={band.imageUrl ?? "/images/placeholder-band.jpg"}
          alt={band.name}
          width={800}
          height={500}
          className="w-full h-full object-cover"
          //priority={false}
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
          <div className="flex items-start gap-3">
            <span className="text-xs text-gray-400">MOODS:</span>

            <div className="flex flex-wrap gap-1">
              {(band.moods ?? []).slice(0, 3).map((mood: string) => (
                <span
                  key={mood}
                  className="bg-orange-900 text-orange-200 px-2 py-1 rounded text-xs"
                >
                  {mood}
                </span>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                onClick={() => onDetails(String(band.id))}
                className="mt-4 w-full rounded-md  hover:bg-white/10   px-3 py-2 text-sm text-white"
              >
                <FaEye className="text-xl text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
