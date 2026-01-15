import CreateBandOrchestrator from "@/modules/recommendation/ui/create/CreateBandOrchestrator";
import { RequireAuth } from "@/modules/recommendation/ui/RequireAuth";

export default function Page() {
  return (
    <RequireAuth>
      <CreateBandOrchestrator />
    </RequireAuth>
  );
}
