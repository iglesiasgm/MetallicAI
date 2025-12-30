import { FaFire, FaGuitar, FaSkull } from "react-icons/fa";

export default function CatalogHeader({
  horrorFont,
  metalFont,
}: {
  horrorFont: string;
  metalFont: string;
}) {
  return (
    <div className="text-center mb-16">
      <h1
        className={[
          "text-5xl sm:text-6xl lg:text-7xl font-bold mb-4",
          horrorFont,
          // blood-text
          "bg-gradient-to-br from-red-600 via-red-800 to-red-950 bg-clip-text text-transparent",
          "drop-shadow-[0_0_10px_rgba(220,38,38,0.6)]",
        ].join(" ")}
      >
        <FaSkull className="inline-block mr-4 align-middle" />
        LA KRIPTA
        <FaFire className="inline-block ml-4 align-middle" />
      </h1>

      <div className="flex justify-center items-center gap-4 mb-6">
        <div className="w-32 h-px bg-gradient-to-r from-transparent to-red-600" />
        <FaGuitar className="text-red-500 text-3xl" />
        <div className="w-32 h-px bg-gradient-to-l from-transparent to-red-600" />
      </div>

      <p className={["text-gray-300 text-xl sm:text-xl", metalFont].join(" ")}>
        Bienvenido a la <strong className="text-red-600"> KRIPTA </strong> del
        metal. Explora el catálogo y encuentra tu próxima obsesión musical.
      </p>
    </div>
  );
}
