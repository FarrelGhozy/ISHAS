import Image from 'next/image';

export function IshasMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className="brand-lockup">
      <span
        className={`brand-logo-shell ${inverse ? 'brand-logo-inverse' : ''}`}
      >
        <Image
          className="brand-logo"
          src="/brand/ishas-mark.png"
          alt=""
          width={42}
          height={42}
          priority
        />
      </span>
      <span>
        <b className={inverse ? 'text-white' : 'text-[#4a0710]'}>ISHAS</b>
        <small className={inverse ? 'text-white/55' : 'text-slate-500'}>
          Integrated Safety &amp; Health
          <br />
          Assessment System
        </small>
      </span>
    </div>
  );
}
