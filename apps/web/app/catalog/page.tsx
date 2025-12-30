import CatalogOrchestrator from "@/modules/recommendation/ui/catalog/CatalogOrchestrator";
import { Creepster, Metal_Mania } from "next/font/google";

const horror = Creepster({ weight: "400", subsets: ["latin"] });
const metal = Metal_Mania({ weight: "400", subsets: ["latin"] });

export default function CatalogPage() {
  return (
    <CatalogOrchestrator
      horrorFont={horror.className}
      metalFont={metal.className}
    />
  );
}
