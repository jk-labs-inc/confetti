import EntryVotersChip from "@components/EntryVoters/Chip";
import { Proposal } from "@components/_pages/ProposalContent";
import ProposalLayoutGalleryRankOrPlaceholder from "@components/_pages/ProposalContent/components/ProposalLayout/Gallery/components/RankOrPlaceholder";
import WinnerBadge from "@components/_pages/ProposalContent/components/WinnerCelebration/WinnerBadge";
import WinnerConfetti from "@components/_pages/ProposalContent/components/WinnerCelebration/WinnerConfetti";
import { ENTRY_ACCENT_COLOR } from "@helpers/entryColors";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { ContestStatus } from "@hooks/useContestStatus/store";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import { isWinningEntry } from "@hooks/useProposal/utils";
import { CSSProperties, FC, useMemo } from "react";
import { ENTRY_ACCENT_GLOW, FOIL_PX, GRAIN_URL } from "./constants";
import EntryCaption from "./EntryCaption";
import EntryImage from "./EntryImage";
import EntryTitleArt from "./EntryTitleArt";
import { parseEntry } from "./parseEntry";
import ShadowCrossfade from "./ShadowCrossfade";

const WINNER_FOIL_BG = "var(--background-image-gradient-gold)";
const RESTING_SHADOW = "0 0 0 1px rgba(255,255,255,0.22), 0 0 22px -2px rgba(255,255,255,0.26)";
const TITLE_ART_STYLE: CSSProperties = { background: "linear-gradient(180deg, #1a1a1a 0%, #0c0c0c 54%, #050505 100%)" };
const GRAIN_STYLE: CSSProperties = { backgroundImage: GRAIN_URL, backgroundSize: "120px 120px", opacity: 0.06 };

interface EntryCardProps {
  proposal: Proposal;
  enabledPreview: EntryPreview | null;
  contestStatus: ContestStatus;
  centered: boolean;
  imageFetchPriority: "high" | "low";
  onPrevious?: () => void;
  onNext?: () => void;
}

const EntryCard: FC<EntryCardProps> = ({
  proposal,
  enabledPreview,
  contestStatus,
  centered,
  imageFetchPriority,
  onPrevious,
  onNext,
}) => {
  const entry = useMemo(() => parseEntry(proposal, enabledPreview), [proposal, enabledPreview]);
  const isCanceled = useContestStateStore(state => state.contestState) === ContestStateEnum.Canceled;
  const isWinner = isWinningEntry(proposal, contestStatus, isCanceled);
  const showVotes = contestStatus === ContestStatus.VotingOpen || contestStatus === ContestStatus.VotingClosed;
  const foilBg = isWinner ? WINNER_FOIL_BG : centered ? ENTRY_ACCENT_COLOR : "transparent";
  const imageUrl = entry.kind === "image" ? entry.imageUrl.trim() : "";

  return (
    <div className="relative h-full w-full rounded-2xl" style={{ background: foilBg, padding: FOIL_PX }}>
      <ShadowCrossfade activeShadow={ENTRY_ACCENT_GLOW} restingShadow={RESTING_SHADOW} active={centered} />
      <div className="relative isolate flex h-full w-full flex-col overflow-hidden rounded-[14px] bg-true-black">
        <div className="relative min-h-0 flex-1 overflow-hidden" style={entry.kind === "title" ? TITLE_ART_STYLE : undefined}>
          {imageUrl ? <EntryImage key={imageUrl} src={imageUrl} fetchPriority={imageFetchPriority} /> : null}
          {entry.kind === "title" ? <EntryTitleArt title={entry.title || "untitled entry"} /> : null}
          <div className="pointer-events-none absolute inset-0" style={GRAIN_STYLE} />
        </div>
        <EntryCaption
          title={entry.kind === "title" ? "" : entry.title}
          votes={showVotes ? proposal.votes : null}
          onPrevious={onPrevious}
          onNext={onNext}
        />
      </div>

      {proposal.rank ? (
        <div className="pointer-events-none absolute -top-5 left-3 z-10 -rotate-6 drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]">
          <ProposalLayoutGalleryRankOrPlaceholder rank={proposal.rank} />
        </div>
      ) : null}

      {isWinner ? <WinnerBadge variant="floating" /> : null}

      {centered ? (
        <div className="absolute -top-4 right-3 z-20">
          <EntryVotersChip proposalId={proposal.id} enabled />
        </div>
      ) : null}

      {isWinner && centered ? <WinnerConfetti /> : null}
    </div>
  );
};

export default EntryCard;
