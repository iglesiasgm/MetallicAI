import { FaFire, FaSkullCrossbones } from "react-icons/fa";

export default function CatalogFooter({ metalFont }: { metalFont: string }) {
  return (
    <div className="mt-16 text-center">
      <div className="flex justify-center items-center gap-6 mb-8">
        <FaSkullCrossbones className="text-red-500 text-2xl drop-shadow-[0_0_12px_rgba(220,38,38,0.55)]" />
        <div className="w-24 h-px bg-gradient-to-r from-red-600 to-transparent" />
        <FaFire className="text-orange-500 text-3xl drop-shadow-[0_0_12px_rgba(251,146,60,0.45)]" />
        <div className="w-24 h-px bg-gradient-to-l from-red-600 to-transparent" />
        <FaSkullCrossbones className="text-red-500 text-2xl drop-shadow-[0_0_12px_rgba(220,38,38,0.55)]" />
      </div>

      <p className={["text-gray-500 text-lg", metalFont].join(" ")}>
        "Suddenly, life has new meaning" - Burzum
      </p>
    </div>
  );
}
