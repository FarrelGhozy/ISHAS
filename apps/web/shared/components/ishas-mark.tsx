// Logo ISHAS — disamakan dengan HIBAH_INTERNAL/apps/web/shared/components/ishas-mark.tsx.
// Adaptasi: <img> biasa (React Router + Vite), bukan next/image. Aset: /brand/ishas-mark.png.

type IshasMarkProps = {
  inverse?: boolean;
  variant?: "default" | "login" | "compact";
};

export function IshasMark({ inverse = false, variant = "default" }: IshasMarkProps) {
  return (
    <div className={`brand-lockup brand-lockup-${variant}`}>
      <span className={`brand-logo-shell${inverse ? " brand-logo-inverse" : ""}`}>
        <img
          className="brand-logo"
          src="/brand/ishas-mark.png"
          alt="Logo ISHAS"
          width={42}
          height={42}
          loading="eager"
        />
      </span>
      <span>
        <b className={inverse ? "text-white" : "text-[#4a0710]"}>ISHAS</b>
        <small className={inverse ? "text-white/55" : "text-slate-500"}>
          Integrated Safety &amp; Health
          <br />
          Assessment System
        </small>
      </span>
    </div>
  );
}
