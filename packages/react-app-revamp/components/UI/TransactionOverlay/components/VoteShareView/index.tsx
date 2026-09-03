import GradientText from "@components/UI/GradientText";
import { generateTwitterShareUrlForVotedEntry } from "@helpers/share";
import { motion } from "motion/react";
import { FC } from "react";
import { VOTE_SHARE_COPY } from "../../copy";
import { TransactionOverlayPlacement, TransactionOverlaySuccessMeta, TransactionOverlayVoteShare } from "../../types";
import OverlayCloseButton from "../OverlayCloseButton";
import ShareOnXButton from "../ShareOnXButton";
import SuccessBurst from "../SuccessBurst";

const FULLSCREEN_SCROLL_PADDING_CLASS =
  "px-6 pt-[calc(env(safe-area-inset-top)_+_2rem)] pb-[calc(env(safe-area-inset-bottom)_+_2rem)]";

interface VoteShareViewProps {
  meta: TransactionOverlaySuccessMeta | null;
  share: TransactionOverlayVoteShare | null;
  placement: TransactionOverlayPlacement;
}

const VoteShareView: FC<VoteShareViewProps> = ({ meta, share, placement }) => {
  const isFullscreen = placement === TransactionOverlayPlacement.FULLSCREEN;

  const content = (
    <div
      className={`flex w-full flex-col gap-10 ${isFullscreen ? "max-w-[420px]" : "mb-auto"}`}
      id={meta?.id}
      {...meta?.dataAttributes}
    >
      <motion.div
        className="flex flex-col gap-4 text-[16px] text-neutral-11"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
      >
        <div className="mb-3">
          <GradientText isFontSabo={false} textSizeClassName="text-[24px] font-bold">
            {VOTE_SHARE_COPY.heading}
          </GradientText>
        </div>
        <p className="font-bold">{VOTE_SHARE_COPY.hook}</p>
        <p>{VOTE_SHARE_COPY.lead}</p>
        <ul className="flex flex-col gap-1.5">
          {VOTE_SHARE_COPY.reasons.map(reason => (
            <li key={reason.text} className="flex items-baseline gap-2">
              <span aria-hidden="true">{reason.emoji}</span>
              <span>{reason.text}</span>
            </li>
          ))}
        </ul>
        <p className="font-bold">{VOTE_SHARE_COPY.closer}</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3, ease: "easeOut" }}
      >
        <ShareOnXButton href={generateTwitterShareUrlForVotedEntry(share ?? {})} />
      </motion.div>
    </div>
  );

  if (!isFullscreen) {
    return (
      <>
        <OverlayCloseButton placement={placement} />
        {content}
      </>
    );
  }

  return (
    <>
      <OverlayCloseButton placement={placement} />
      <SuccessBurst />
      <div className={`absolute inset-0 overflow-y-auto ${FULLSCREEN_SCROLL_PADDING_CLASS}`}>
        <div className="flex min-h-full flex-col items-center justify-center">{content}</div>
      </div>
    </>
  );
};

export default VoteShareView;
