import { FC } from "react";

interface ShadowCrossfadeProps {
  activeShadow: string;
  restingShadow: string;
  active: boolean;
}

const ShadowCrossfade: FC<ShadowCrossfadeProps> = ({ activeShadow, restingShadow, active }) => (
  <>
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300 ease-out ${
        active ? "opacity-100" : "opacity-0"
      }`}
      style={{ boxShadow: activeShadow }}
    />
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300 ease-out ${
        active ? "opacity-0" : "opacity-100"
      }`}
      style={{ boxShadow: restingShadow }}
    />
  </>
);

export default ShadowCrossfade;
