// `/admin` → dashboard sistem (ROUTES §5).
import { Navigate } from "react-router";

export default function Route() {
  return <Navigate to="/admin/dashboard" replace />;
}
