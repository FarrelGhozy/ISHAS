// Alih D-17: URL lama /pengelola/* → /pesantren/* (fungsi tetap, hanya nama peran).
import { Navigate, useLocation } from "react-router";

export default function Route() {
  const location = useLocation();
  const suffix = location.pathname.replace(/^\/pengelola(?=\/|$)/, "");
  const target = `/pesantren${suffix}${location.search}${location.hash}`;
  return <Navigate to={target} replace />;
}
