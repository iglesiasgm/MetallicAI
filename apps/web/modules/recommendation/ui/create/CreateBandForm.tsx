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
  FaYoutube,
} from "react-icons/fa";
import TagEditor from "./TagEditor";
import MemberEditor from "./MemberEditor";
import { CreateBandInput, Member } from "../../domain/Create";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

const inputBase =
  "w-full rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none " +
  "bg-gradient-to-br from-[#2d2d2d] to-[#1a1a1a] border-2 border-[#444] " +
  "focus:border-red-600 focus:shadow-[0_0_20px_rgba(220,38,38,0.30)] transition";

const cardBase =
  "rounded-lg border-2 border-[#333] " +
  "bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] " +
  "shadow-[0_8px_32px_rgba(220,38,38,0.20)]";

type FieldErrors = Partial<
  Record<
    | "name"
    | "description"
    | "subgenres"
    | "moods"
    | "features"
    | "members"
    | "spotify"
    | "youtube",
    string
  >
>;

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ✅ “Todos los datos completos” (YouTube optativo)
// - name requerido
// - description requerido
// - subgenres/moods/features al menos 1
// - members: todas las filas completas (name/role/period) y al menos 1
// - spotify requerido y URL válida
// - youtube: si viene, URL válida
function validate(input: CreateBandInput): FieldErrors {
  const errors: FieldErrors = {};

  if (!input.name.trim()) errors.name = "Band name is required.";
  if (!input.description.trim())
    errors.description = "Description is required.";

  if (!input.subgenres.length) errors.subgenres = "Add at least one subgenre.";
  if (!input.moods.length) errors.moods = "Add at least one mood.";
  if (!input.features.length) errors.features = "Add at least one feature.";

  const spotifyUrl = input.links?.find((l) => l.spotify)?.spotify?.trim() ?? "";
  if (!spotifyUrl) errors.spotify = "Spotify link is required.";
  else if (!isValidUrl(spotifyUrl))
    errors.spotify = "Spotify link must be a valid URL.";

  const youtubeUrl = input.links?.find((l) => l.youtube)?.youtube?.trim() ?? "";
  if (youtubeUrl && !isValidUrl(youtubeUrl))
    errors.youtube = "YouTube link must be a valid URL.";

  if (!input.members.length) {
    errors.members = "Add at least one member.";
  } else {
    const allComplete = input.members.every(
      (m) => m.name.trim() && m.role.trim() && (m.period ?? "").trim()
    );
    if (!allComplete)
      errors.members = "Complete name, role and period for all members.";
  }

  return errors;
}

export default function CreateBandForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  // ✅ Estado usando nombres del backend: CreateBandInput
  const [input, setInput] = useState<CreateBandInput>({
    name: "",
    subgenres: [],
    moods: [],
    features: [],
    description: "",
    members: [{ name: "", role: "", period: "" }],
    links: [{ spotify: "", youtube: "" }], // 1 objeto alcanza para que el backend encuentre spotify
  });

  const errors = useMemo(() => validate(input), [input]);
  const canSubmit = useMemo(() => Object.keys(errors).length === 0, [errors]);

  function patch(p: Partial<CreateBandInput>) {
    setInput((prev) => ({ ...prev, ...p }));
  }

  function setLink(key: "spotify" | "youtube", value: string) {
    setInput((prev) => {
      const first = prev.links?.[0] ?? {};
      return { ...prev, links: [{ ...first, [key]: value }] };
    });
  }

  function getLink(key: "spotify" | "youtube") {
    return (input.links?.[0]?.[key] ?? "") as string;
  }

  function onCancel() {
    router.back();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    setSubmitError(null);

    if (!canSubmit) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/bands`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setSubmitError(data?.error ?? "Request failed");
        return;
      }

      // Opcional: reset o navegación
      alert("Band created successfully!");
      router.push("/catalog"); // ajustá si tu ruta de listado es otra
    } catch (err: any) {
      setSubmitError(err?.message ?? "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={`${cardBase} p-6 sm:p-8`}>
      {submitError && (
        <div className="mb-6 rounded-lg border border-red-700/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {submitError}
        </div>
      )}

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
              value={input.name}
              onChange={(e) => patch({ name: e.target.value })}
              className={inputBase}
              placeholder="Enter band name..."
              required
            />
            {touched && errors.name && (
              <p className="mt-2 text-xs text-red-300">{errors.name}</p>
            )}
          </div>

          <div>
            <TagEditor
              label="Subgenres"
              icon={<FaTags />}
              placeholder="Add subgenre and press Enter..."
              values={input.subgenres}
              onChange={(subgenres) => patch({ subgenres })}
            />
            {touched && errors.subgenres && (
              <p className="mt-2 text-xs text-red-300">{errors.subgenres}</p>
            )}
          </div>

          <div>
            <TagEditor
              label="Moods"
              icon={<FaHeart />}
              placeholder="Add mood and press Enter..."
              values={input.moods}
              onChange={(moods) => patch({ moods })}
            />
            {touched && errors.moods && (
              <p className="mt-2 text-xs text-red-300">{errors.moods}</p>
            )}
          </div>

          <div>
            <TagEditor
              label="Musical Features"
              icon={<FaFire />}
              placeholder="Add feature and press Enter..."
              values={input.features}
              onChange={(features) => patch({ features })}
            />
            {touched && errors.features && (
              <p className="mt-2 text-xs text-red-300">{errors.features}</p>
            )}
          </div>

          <div>
            <label className="block text-red-400 font-bold mb-2 text-sm uppercase tracking-wider">
              <span className="inline-flex items-center gap-2">
                <FaScroll /> Description
              </span>
            </label>
            <textarea
              value={input.description}
              onChange={(e) => patch({ description: e.target.value })}
              className={`${inputBase} h-32 resize-none`}
              placeholder="Describe the band's style, history, and characteristics..."
            />
            {touched && errors.description && (
              <p className="mt-2 text-xs text-red-300">{errors.description}</p>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6">
          <div>
            <MemberEditor
              value={input.members as Member[]}
              onChange={(members) => patch({ members })}
            />
            {touched && errors.members && (
              <p className="mt-2 text-xs text-red-300">{errors.members}</p>
            )}
          </div>

          {/* Spotify */}
          <div>
            <label className="block text-red-400 font-bold mb-2 text-sm uppercase tracking-wider">
              <span className="inline-flex items-center gap-2">
                <FaLink /> Spotify Link
              </span>
            </label>

            <input
              value={getLink("spotify")}
              onChange={(e) => setLink("spotify", e.target.value)}
              type="url"
              className={inputBase}
              placeholder="https://open.spotify.com/artist/..."
            />
            {touched && errors.spotify && (
              <p className="mt-2 text-xs text-red-300">{errors.spotify}</p>
            )}
          </div>

          {/* ✅ YouTube (optativo) */}
          <div>
            <label className="block text-red-400 font-bold mb-2 text-sm uppercase tracking-wider">
              <span className="inline-flex items-center gap-2">
                <FaYoutube /> YouTube Link{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </span>
            </label>

            <input
              value={getLink("youtube")}
              onChange={(e) => setLink("youtube", e.target.value)}
              type="url"
              className={inputBase}
              placeholder="https://www.youtube.com/@band... (optional)"
            />
            {touched && errors.youtube && (
              <p className="mt-2 text-xs text-red-300">{errors.youtube}</p>
            )}
          </div>
        </div>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="mt-6 rounded-lg border border-red-700/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          <p className="font-semibold mb-2">Missing / invalid fields:</p>
          <ul className="list-disc pl-5 space-y-1">
            {Object.entries(errors).map(([k, v]) => (
              <li key={k}>{v}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 pt-6 border-t border-gray-700 flex justify-center gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-lg px-8 py-3 font-bold
                     bg-gray-700 hover:bg-gray-600 transition-colors"
          disabled={loading}
        >
          <FaTimes />
          Cancel
        </button>

        <button
          type="submit"
          disabled={!canSubmit || loading}
          className={[
            "inline-flex items-center gap-2 rounded-lg px-8 py-3 font-bold",
            "bg-gradient-to-br from-red-600 to-red-800",
            "shadow-[0_4px_15px_rgba(220,38,38,0.40)] transition",
            "hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(220,38,38,0.60)]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
          ].join(" ")}
        >
          <FaPlus />
          {loading ? "Creating..." : "Create Band"}
        </button>
      </div>
    </form>
  );
}
