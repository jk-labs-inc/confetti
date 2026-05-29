import { getContestImageUrl } from "@layouts/LayoutViewContest/helpers/getContestImageUrl";
import { CONTEST_IMAGE_PRESETS } from "lib/image/cloudflare";
import { useCloudflareBackgroundImage } from "lib/image/useCloudflareImage";
import { motion } from "motion/react";
import { FC, ReactNode, useState, useEffect } from "react";

interface ContestCardContainerProps {
  prompt: string | null;
  children?: ReactNode;
}

export const contestImageGradient = {
  fade: "linear-gradient(180deg, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 0.70) 85%)",
};

const ContestCardContainer: FC<ContestCardContainerProps> = ({ prompt, children }) => {
  const contestImageUrl = getContestImageUrl(prompt);
  const { url: optimizedImageUrl, backgroundImage } = useCloudflareBackgroundImage(
    contestImageUrl,
    CONTEST_IMAGE_PRESETS.landingCard,
  );
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Blur-up: preload the SAME optimized asset used for the background so the blur
  // clears without ever fetching the multi-MB original.
  useEffect(() => {
    if (!optimizedImageUrl) return;

    setIsImageLoaded(false);
    const img = new Image();
    img.src = optimizedImageUrl;
    img.onload = () => {
      setIsImageLoaded(true);
    };
  }, [optimizedImageUrl]);

  return (
    <motion.div
      className="w-full md:w-80 h-64 rounded-lg border border-primary-2 overflow-hidden relative hover:border-primary-3 transition-all duration-300"
      initial="idle"
      whileHover="hover"
    >
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: backgroundImage ?? "linear-gradient(155deg, #381D4C -2.14%, #000 33.85%)",
          willChange: "transform",
          ...(optimizedImageUrl && {
            filter: isImageLoaded ? "blur(0px)" : "blur(10px)",
            transition: isImageLoaded ? "filter 0.5s linear" : "none",
          }),
        }}
        variants={{
          idle: { scale: 1 },
          hover: { scale: 1.1 },
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
      {optimizedImageUrl && (
        <div
          className="absolute inset-0"
          style={{
            background: contestImageGradient.fade,
          }}
        />
      )}
      <div className="relative h-full px-4 pb-2 flex flex-col justify-end">{children}</div>
    </motion.div>
  );
};

export default ContestCardContainer;
