"use client";

import { FrameLoader } from "./FrameLoader";

interface LoaderProps {
  className?: string;
  children?: React.ReactNode;
  size?: number;
}

export const Loader = ({ children, className, size = 72 }: LoaderProps) => {
  return (
    <div className={`flex flex-col gap-8 items-center justify-center mt-40 ${className}`}>
      <FrameLoader size={size} />
      <p className="font-sabo-filled text-neutral-14 text-[16px]">{children ?? "Loading, one moment please"}</p>
    </div>
  );
};

export default Loader;
