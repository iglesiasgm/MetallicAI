"use client";

export default function LoadMoreButton({
  loading,
  onClick,
}: {
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className="
        px-6 py-3 rounded-xl
        bg-red-700/80 hover:bg-red-700
        text-white font-semibold
        border border-red-900/60
        shadow-[0_0_18px_rgba(220,38,38,0.25)]
        transition
        disabled:opacity-60 disabled:cursor-not-allowed
      "
    >
      {loading ? "Loading..." : "Load more"}
    </button>
  );
}
