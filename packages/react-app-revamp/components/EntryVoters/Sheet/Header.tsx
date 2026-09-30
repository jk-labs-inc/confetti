import { MEDAL_IMAGES } from "@components/PriceCurve/components/Voters/components/EntryRankMedal";
import { formatNumberWithCommas } from "@helpers/formatNumber";
import { pluralize } from "@helpers/pluralize";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { CONTEST_IMAGE_PRESETS } from "lib/image/cloudflare";
import { useCloudflareImage } from "lib/image/useCloudflareImage";
import { FC } from "react";
import { EntryVotersSheetEntry } from "./useSheetEntry";

interface EntryVotersSheetHeaderProps {
  entry: EntryVotersSheetEntry;
  voterCount: number;
  onClose: () => void;
}

const EntryVotersSheetHeader: FC<EntryVotersSheetHeaderProps> = ({ entry, voterCount, onClose }) => {
  const thumb = useCloudflareImage(entry.image, CONTEST_IMAGE_PRESETS.landingCardThumb);
  const medalSrc = MEDAL_IMAGES[entry.rank];

  return (
    <div className="flex items-center gap-3">
      {entry.image ? (
        <img
          src={thumb.src}
          srcSet={thumb.srcSet}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-12 w-12 shrink-0 rounded-[12px] object-cover"
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[18px] font-bold normal-case text-neutral-11">{entry.title}</p>
          {medalSrc ? (
            <img src={medalSrc} alt={`rank ${entry.rank}`} className="h-6 w-6 shrink-0 object-contain" />
          ) : null}
        </div>
        <p className="text-[14px] tabular-nums text-neutral-9">
          {formatNumberWithCommas(entry.votes)} votes · {pluralize(voterCount, "voter", "voters")}
        </p>
      </div>
      <button
        type="button"
        aria-label="close voters"
        onClick={onClose}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-2"
      >
        <XMarkIcon className="h-5 w-5 text-neutral-11" />
      </button>
    </div>
  );
};

export default EntryVotersSheetHeader;
