import { CSSProperties, FC } from "react";

const BEAM_STYLE: CSSProperties = {
  clipPath: "polygon(40% 0, 60% 0, 100% 100%, 0 100%)",
  background:
    "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.045) 45%, rgba(255,255,255,0.11) 100%)",
};

const POOL_STYLE: CSSProperties = {
  background: "radial-gradient(closest-side, rgba(255,255,255,0.16), rgba(255,255,255,0.04) 65%, transparent)",
};

const Spotlight: FC = () => (
  <>
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-1 left-1/2 h-[240px] w-[300px] -translate-x-1/2 blur-lg"
    >
      <div className="h-full w-full" style={BEAM_STYLE} />
    </div>
    <div
      aria-hidden
      className="pointer-events-none absolute -bottom-5 left-1/2 h-12 w-[320px] -translate-x-1/2"
      style={POOL_STYLE}
    />
  </>
);

export default Spotlight;
