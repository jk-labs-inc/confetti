import { useXClaimBoard } from "@components/XClaim/board";
import { X_CLAIM_ART, type XClaimArt } from "@components/XClaim/constants";
import { CLAIM_PLUS_LABEL } from "@components/XClaim/copy";
import { CLAIM_AMOUNT_LABEL } from "lib/xClaim/constants";
import { FC } from "react";

export type BoardHeroBubble = "on_us" | "one_more_tap";

interface BoardHeroProps {
  art: XClaimArt;
  size: number;
  modalSize?: number;
  bubble?: BoardHeroBubble;
  coin?: boolean;
}

const HERO_STICKER_OFFSET_RATIO = 0.3;

const BUBBLE_TONE_CLASS = {
  on_us: "bg-primary-10",
  one_more_tap: "bg-neutral-11",
} as const;

const BoardHero: FC<BoardHeroProps> = ({ art, size, modalSize, bubble, coin }) => {
  const { layout } = useXClaimBoard();
  const px = layout === "modal" ? (modalSize ?? size) : size;
  const { src, alt } = X_CLAIM_ART[art];
  const stickerLeft = `calc(50% + ${Math.round(px * HERO_STICKER_OFFSET_RATIO)}px)`;

  return (
    <div className="relative flex shrink-0 justify-center" style={{ height: px }}>
      <img src={src} alt={alt} width={px} height={px} className="object-contain" style={{ width: px, height: px }} />
      {bubble && (
        <div
          className={`absolute whitespace-nowrap rounded-[18px_18px_18px_4px] px-3.5 py-2 text-[15px] font-black text-true-black rotate-5 ${
            layout === "modal" ? "top-1.5" : "top-0"
          } ${BUBBLE_TONE_CLASS[bubble]}`}
          style={{ left: stickerLeft }}
        >
          {bubble === "on_us" ? (
            <>
              <span className="font-sabo-filled text-[18px] font-normal">{CLAIM_AMOUNT_LABEL}</span> on us!
            </>
          ) : (
            "one more tap!"
          )}
        </div>
      )}
      {coin && (
        <div
          className="absolute top-32 flex size-21 items-center justify-center rounded-full bg-primary-10 text-true-black -rotate-10"
          style={{ left: stickerLeft }}
        >
          <span className="font-sabo-filled text-[28px] leading-none">{CLAIM_PLUS_LABEL}</span>
        </div>
      )}
    </div>
  );
};

export default BoardHero;
