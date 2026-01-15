import AdminModerationOrchestrator from "@/modules/recommendation/ui/admin/AdminModerationOrchestrator";
import { RequireAdmin } from "@/modules/recommendation/ui/RequireAdmin";

export default function Page() {
  return (
    <RequireAdmin>
      <AdminModerationOrchestrator />
    </RequireAdmin>
  );
}
