// Alih D-17: URL lama /peneliti/* → /validator/* (fungsi tetap, hanya nama peran).
import { Navigate, useLocation } from "react-router";

export default function Route() {
  const location = useLocation();
  const suffix = location.pathname.replace(/^\/peneliti(?=\/|$)/, "");
  const target = `/validator${suffix}${location.search}${location.hash}`;
  return <Navigate to={target} replace />;
}
