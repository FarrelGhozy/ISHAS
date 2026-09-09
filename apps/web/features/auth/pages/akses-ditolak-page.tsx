// `/akses-ditolak` — pesan + tombol kembali kontekstual (ROUTES §3).

import { useNavigate } from "react-router";
import { ShieldX } from "lucide-react";
import { useCurrentUser } from "~/shared/auth/use-current-user";
import { workspaceHome } from "~/shared/auth/access-policy";

export function AksesDitolakPage() {
  const navigate = useNavigate();
  const user = useCurrentUser();

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="surface max-w-md p-8 text-center">
        <ShieldX size={28} className="mx-auto text-primary" aria-hidden />
        <h1 className="mt-3 text-lg font-extrabold text-heading">Akses ditolak</h1>
        {user ? (
          <>
            <p className="mt-2 text-xs text-secondary-text">
              Akun {user.role} hanya dapat membuka ruang kerjanya.
            </p>
            <button
              type="button"
              className="primary-button mt-4"
              onClick={() => navigate(workspaceHome(user.roleId))}
            >
              Kembali ke ruang kerja
            </button>
          </>
        ) : (
          <>
            <p className="mt-2 text-xs text-secondary-text">
              Halaman ini memerlukan sesi login dengan peran yang sesuai.
            </p>
            <button
              type="button"
              className="primary-button mt-4"
              onClick={() => navigate("/login")}
            >
              Ke halaman masuk
            </button>
          </>
        )}
        <button type="button" className="text-button mt-3 block w-full" onClick={() => navigate("/")}>
          Kembali ke dashboard publik
        </button>
      </div>
    </div>
  );
}
