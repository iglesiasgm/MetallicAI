import RecommendOrchestrator from "@/modules/recommendation/ui/recommend/RecommendOrchestrator";

import { Creepster, Metal_Mania } from "next/font/google";

const horror = Creepster({ weight: "400", subsets: ["latin"] });
const metal = Metal_Mania({ weight: "400", subsets: ["latin"] });

export default function RecommendPage() {
  return (
    <RecommendOrchestrator
      horrorFont={horror.className}
      metalFont={metal.className}
    />
  );
}
