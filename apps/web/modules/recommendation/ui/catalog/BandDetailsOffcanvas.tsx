"use client";

import { FaSpotify } from "react-icons/fa6";
import type { Band } from "../../domain/Catalog";
import { FaYoutube } from "react-icons/fa";

export default function BandDetailsOffcanvas({
  open,
  onClose,
  loading,
  error,
  band,
}: {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  error: string | null;
  band: Band | null;
}) {
  const linksArr = Array.isArray(band?.links)
    ? band.links
    : band?.links
    ? [band.links as any]
    : [];

  const spotify = linksArr.find((l) => l?.spotify?.trim())?.spotify;
  const youtube = linksArr.find((l) => l?.youtube?.trim())?.youtube;
  const instagram = linksArr.find((l) => l?.instagram?.trim())?.instagram;

  return (
    <>
      {/* Backdrop */}
      <div
        className={[
          "fixed inset-0 z-40 bg-black/60 transition-opacity",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={[
          "fixed top-0 right-0 z-50 h-full w-full sm:w-[520px]",
          "bg-gradient-to-br from-[#0d0d0d] to-[#1a1a1a] border-l border-red-900/40",
          "shadow-2xl transform transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-gray-400">
                Band details
              </p>
              <h3 className="text-lg font-bold text-red-400 truncate">
                {band?.name ?? (loading ? "Loading..." : "—")}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="rounded-md px-3 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 text-white"
            >
              Close
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {loading && <div className="text-gray-300 text-sm">Loading…</div>}

            {!loading && error && (
              <div className="rounded-lg border border-red-700/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {!loading && !error && band && (
              <>
                {band.imageUrl && (
                  <div className=" h-56 rounded-lg overflow-hidden  ">
                    <img
                      src={band.imageUrl}
                      alt={band.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                <section className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <h4 className="text-sm font-bold text-red-300 mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-gray-200 whitespace-pre-line">
                    {band.description}
                  </p>
                </section>

                <section className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-red-300 mb-2">
                      Subgenres
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {band.subgenres?.map((x) => (
                        <span
                          key={x}
                          className="text-xs px-2 py-1 rounded-full bg-red-700/30 border border-red-700/40 text-white"
                        >
                          {x}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-red-300 mb-2">
                      Moods
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {band.moods?.map((x) => (
                        <span
                          key={x}
                          className="text-xs px-2 py-1 rounded-full bg-red-700/30 border border-red-700/40 text-white"
                        >
                          {x}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-red-300 mb-2">
                      Features
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {band.features?.map((x) => (
                        <span
                          key={x}
                          className="text-xs px-2 py-1 rounded-full bg-red-700/30 border border-red-700/40 text-white"
                        >
                          {x}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <h4 className="text-sm font-bold text-red-300 mb-2">
                    Members
                  </h4>
                  <div className="space-y-2">
                    {band.members?.map((m: any, idx: number) => (
                      <div key={idx} className="text-sm text-gray-200">
                        <div className="font-semibold">{m.name}</div>
                        <div className="text-gray-400 text-xs">
                          {m.role}
                          {m.period ? ` • ${m.period}` : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <h4 className="text-sm font-bold text-red-300 mb-2">Links</h4>

                  {!spotify && !youtube && !instagram ? (
                    <p className="text-sm text-gray-400">No links available.</p>
                  ) : (
                    <div className="space-y-2 text-sm space-x-2">
                      {spotify && (
                        <a
                          href={spotify}
                          target="_blank"
                          rel="noreferrer"
                          title="Open in Spotify"
                          aria-label="Open in Spotify"
                          className="inline-flex items-center justify-center
               text-green-500 hover:text-green-400 transition"
                        >
                          <FaSpotify className="text-2xl" />
                        </a>
                      )}

                      {youtube && (
                        <a
                          className="inline-flex items-center justify-center
               text-red-500 hover:text-red-600 transition"
                          href={youtube}
                          target="_blank"
                          rel="noreferrer"
                          title="Open in Youtube"
                          aria-label="Open in Youtube"
                        >
                          <FaYoutube className="text-2xl" />
                        </a>
                      )}

                      {instagram && (
                        <a
                          className="text-red-300 hover:text-red-200 underline"
                          href={instagram}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Instagram
                        </a>
                      )}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
