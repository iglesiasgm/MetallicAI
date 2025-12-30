import { Band } from "../../domain/Catalog";
import BandCard from "./BandCard";

export default function BandsGrid({
  bands,
  metalFont,
}: {
  bands: Band[];
  metalFont: string;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
      {bands.map((b) => (
        <BandCard key={String(b.id)} band={b} metalFont={metalFont} />
      ))}
    </div>
  );
}
