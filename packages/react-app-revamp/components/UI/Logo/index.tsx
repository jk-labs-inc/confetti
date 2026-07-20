import { FC } from "react";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  fetchPriority?: "high" | "low" | "auto";
}

const Logo: FC<LogoProps> = ({ width = 214, height = 41, className, fetchPriority }) => {
  return (
    <img
      src="/confetti/confetti-logo.png"
      alt="Confetti"
      width={width}
      height={height}
      className={className}
      fetchPriority={fetchPriority}
    />
  );
};

export default Logo;
