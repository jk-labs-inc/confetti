"use client";

import { CONTEST_IMAGE_PRESETS } from "lib/image/cloudflare";
import { useCloudflareImage } from "lib/image/useCloudflareImage";
import { FC } from "react";

export type ContestImageSize = "default" | "small";

interface ContestImageProps {
  imageUrl: string;
  size?: ContestImageSize;
}

const sizeConfig = {
  default: { className: "w-16 h-10 rounded-[16px]", preset: CONTEST_IMAGE_PRESETS.headerThumb },
  small: { className: "w-10 h-[30px] rounded-[8px]", preset: CONTEST_IMAGE_PRESETS.headerThumbSmall },
};

const objectFitClasses: Record<ContestImageSize, string> = {
  default: "object-cover",
  small: "object-contain",
};

const ContestImage: FC<ContestImageProps> = ({ imageUrl, size = "default" }) => {
  const { className, preset } = sizeConfig[size];
  const { src, srcSet } = useCloudflareImage(imageUrl, preset);

  return (
    <div className={`${className} relative overflow-hidden shrink-0`}>
      <img
        src={src}
        srcSet={srcSet}
        width={preset.width}
        height={preset.height}
        alt="contest"
        decoding="async"
        className={`w-full h-full ${objectFitClasses[size]}`}
      />
    </div>
  );
};

export default ContestImage;
