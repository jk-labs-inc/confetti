import CustomLink from "@components/UI/Link";
import { getContestImageUrl } from "@layouts/LayoutViewContest/helpers/getContestImageUrl";
import { CONTEST_IMAGE_PRESETS } from "lib/image/cloudflare";
import { useCloudflareImage } from "lib/image/useCloudflareImage";
import { FC, ReactNode, useState } from "react";

interface CardHeaderProps {
  prompt: string | null;
  title: string;
  contestUrl: string;
  isEnded: boolean;
  action?: ReactNode;
}

const CardHeader: FC<CardHeaderProps> = ({ prompt, title, contestUrl, isEnded, action }) => {
  const imageUrl = getContestImageUrl(prompt);
  const [imageFailed, setImageFailed] = useState(false);
  const { src, srcSet } = useCloudflareImage(imageUrl, CONTEST_IMAGE_PRESETS.landingCardThumb);
  const showImage = !!imageUrl && !imageFailed;

  return (
    <div className="flex items-center gap-3 min-h-12">
      <CustomLink href={contestUrl} prefetch={true} className="flex flex-1 items-center gap-3 min-w-0">
        {showImage && (
          <img
            src={src}
            srcSet={srcSet}
            alt=""
            onError={() => setImageFailed(true)}
            className="w-12 h-12 rounded-lg object-cover shrink-0"
          />
        )}
        <p
          className={`text-[20px] leading-6 font-normal normal-case line-clamp-2 min-w-0 break-words ${
            isEnded ? "text-neutral-9" : "text-neutral-11"
          }`}
        >
          {title}
        </p>
      </CustomLink>
      {action}
    </div>
  );
};

export default CardHeader;
