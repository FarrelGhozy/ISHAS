// `/pesantren` workspace → Dashboard Pesantren (ROUTES §5, D-34).
// Bedakan dari profil publik `/pesantren/:kode` (route statis lebih diutamakan).
import { Navigate } from "react-router";

export default function Route() {
  return <Navigate to="/pesantren/dashboard" replace />;
}
