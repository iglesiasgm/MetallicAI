"use client";

import BackgroundVideo from "../BackgroundVideo";
import AdminModerationPanel from "./AdminModerationPanel";

export default function AdminModerationOrchestrator() {
  return (
    <main className="relative min-h-screen bg-black text-gray-100 overflow-x-hidden">
      <BackgroundVideo />
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-[#0a0a0a]/40 to-black/60" />
      <div className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-2xl font-semibold mb-2">Admin Moderation</h1>
          <p className="text-sm opacity-80 mb-6">
            Revisá submissions pendientes, aprobá o rechazá.
          </p>

          <AdminModerationPanel />
        </div>
      </div>
    </main>
  );
}
