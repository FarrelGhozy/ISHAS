// `/pesantren/[kode]` — dashboard dengan filter terkunci; kode tak dikenal → empty state (ROUTES §1/§3).

import { useNavigate, useParams } from "react-router";
import { DashboardPage } from "./dashboard-page";

export function PesantrenDetailPage() {
  const { kode } = useParams();
  const navigate = useNavigate();

  if (!kode || !kode.startsWith("PSN-")) {
    return (
      <div className="surface p-6 text-center text-xs font-semibold text-secondary-text">
        Pesantren tidak ditemukan.{" "}
        <button type="button" className="text-button" onClick={() => navigate("/")}>
          Kembali ke dashboard
        </button>
      </div>
    );
  }

  return <DashboardPage lockedInstitutionCode={kode} />;
}
