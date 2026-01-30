import { FC } from "react";

interface LogoProps {
  width?: number;
  height?: number;
}

const Logo: FC<LogoProps> = ({ width = 214, height = 41 }) => {
  return <img src="/confetti/confetti-logo.png" alt="Confetti" width={width} height={height} />;
};

export default Logo;
