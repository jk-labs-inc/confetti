import { FRAME_URLS } from "./constants";
import { useFrameAnimation } from "./useFrameAnimation";

interface FrameLoaderProps {
  size?: number;
}

export const FrameLoader = ({ size = 72 }: FrameLoaderProps) => {
  const { isReady, currentFrame } = useFrameAnimation();

  if (!isReady) {
    return <div style={{ width: size, height: size }} />;
  }

  return (
    <div className="relative" style={{ width: size, height: size }} role="img" aria-label="Loading">
      {FRAME_URLS.map((src, index) => (
        <img
          key={src}
          src={src}
          alt=""
          width={size}
          height={size}
          draggable={false}
          className="absolute inset-0"
          style={{
            visibility: index === currentFrame ? "visible" : "hidden",
          }}
        />
      ))}
    </div>
  );
};
