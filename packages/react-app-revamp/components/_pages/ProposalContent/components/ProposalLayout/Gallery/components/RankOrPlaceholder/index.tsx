import { FC } from "react";

interface ProposalLayoutGalleryRankOrPlaceholderProps {
  rank: number;
}

const MEDAL_IMAGES: Record<number, string> = {
  1: "/contest/gold-medal.png",
  2: "/contest/silver-medal.png",
  3: "/contest/bronze-medal.png",
};

const ProposalLayoutGalleryRankOrPlaceholder: FC<ProposalLayoutGalleryRankOrPlaceholderProps> = ({ rank }) => {
  if (rank === 0) return null;

  const medalSrc = MEDAL_IMAGES[rank];
  if (medalSrc) return <img src={medalSrc} alt={`Rank ${rank}`} className="w-10 h-10 object-contain" />;

  return (
    <div className="w-6 h-6 bg-true-black bg-true-black/40 rounded-full flex items-center justify-center">
      <p
        className="text-neutral-11 text-center text-[16px] font-bold"
        style={{
          textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
        }}
      >
        {rank}
      </p>
    </div>
  );
};

export default ProposalLayoutGalleryRankOrPlaceholder;
