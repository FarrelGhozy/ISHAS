// `/pesantren` workspace → halaman utama Validasi Laporan (ROUTES §5).
// Bedakan dari profil publik `/pesantren/:kode` (route statis lebih diutamakan).
import { Navigate } from "react-router";

export default function Route() {
  return <Navigate to="/pesantren/validasi-laporan" replace />;
}
