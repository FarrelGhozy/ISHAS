// Logo ISHAS — disamakan dengan HIBAH_INTERNAL/apps/web/shared/components/ishas-mark.tsx.
// Adaptasi: <img> biasa (React Router + Vite), bukan next/image. Aset: /brand/ishas-mark.png
// dan /brand/ishas-wordmark.png.

type IshasMarkProps = {
  inverse?: boolean;
  variant?: "default" | "login" | "compact";
  wordmark?: boolean;
};

export function IshasMark({ inverse = false, variant = "default", wordmark = false }: IshasMarkProps) {
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
        {wordmark ? (
          <img
            className="brand-wordmark"
            src="/brand/ishas-wordmark.png"
            alt="ISHAS"
            height={22}
            loading="eager"
          />
        ) : (
          <b className={inverse ? "text-white" : "text-[#2A3F54]"}>ISHAS</b>
        )}
        <small className={inverse ? "text-white/55" : "text-slate-500"}>
          Integrated Safety &amp; Health
          <br />
          Assessment System
        </small>
      </span>
    </div>
  );
}
