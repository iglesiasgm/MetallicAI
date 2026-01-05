"use client";

import { nosifer } from "@/styles/fonts";
import BackgroundVideo from "../BackgroundVideo";
import CreateBandForm from "./CreateBandForm";
import CreateBandHeader from "./CreateBandHeader";

export default function CreateBandOrchestrator() {
  return (
    <main className="relative min-h-screen bg-black text-gray-100 overflow-x-hidden">
      <BackgroundVideo />

      {/* overlay global similar al HTML */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/45 via-[#1a0000]/35 to-black/55" />

      <div className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <CreateBandHeader titleClassName={nosifer.className} />
          <CreateBandForm />
        </div>
      </div>
    </main>
  );
}
