import { resolveOverlayPlacement } from "@components/UI/TransactionOverlay/placement";
import { txOverlay } from "@components/UI/TransactionOverlay/store";
import { TransactionOverlayFlow } from "@components/UI/TransactionOverlay/types";
import { useClaimVoteStore } from "@hooks/useClaimVote/store";
import useCastVotes from "@hooks/useCastVotes";
import { useContestStore } from "@hooks/useContest/store";
import { useHasVoteRail } from "@hooks/useContestLayoutBand";
import usePriceCurveUpdateInterval from "@hooks/usePriceCurveUpdateInterval";
import { castClaimVote } from "lib/claimVote/castClaimVote";
import { voteIntentStore } from "lib/claimVote/storage";
import type { ClaimVoteCasterMount, ContestKey, ContestTarget, VoteOutcome } from "lib/claimVote/types";
import type { XClaimWallet } from "lib/xClaim/types";
import { FC, useEffect, useRef } from "react";
import { useShallow } from "zustand/shallow";

interface ClaimVoteCasterProps {
  mount: ClaimVoteCasterMount;
  target: ContestTarget;
  contestKey: ContestKey;
  wallet: XClaimWallet;
  onDone: (outcome: VoteOutcome) => void;
}

const ClaimVoteCaster: FC<ClaimVoteCasterProps> = ({ mount, target, contestKey, wallet, onDone }) => {
  const { begin, isCurrent } = useClaimVoteStore(
    useShallow(state => ({ begin: state.begin, isCurrent: state.isCurrent })),
  );
  const { charge, votesClose } = useContestStore(
    useShallow(state => ({ charge: state.charge, votesClose: state.votesClose })),
  );
  const hasVoteRail = useHasVoteRail();
  const { castVotes, isReady } = useCastVotes({ charge, votesClose, inlineOverlay: hasVoteRail });
  const { priceCurveUpdateInterval, isLoading: isIntervalLoading } = usePriceCurveUpdateInterval({
    address: target.address,
    abi: target.abi,
    chainId: target.chainId,
  });
  const castRef = useRef(castVotes);
  const mountedRef = useRef(false);
  const hasStartedFeedback = useRef(false);
  const isOwnVote = !mount.payout;

  useEffect(() => {
    castRef.current = castVotes;
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (isOwnVote && !hasStartedFeedback.current) {
      hasStartedFeedback.current = true;
      const placement = resolveOverlayPlacement(hasVoteRail);
      if (placement) txOverlay.start(TransactionOverlayFlow.VOTE, { placement });
    }
  }, [isOwnVote, hasVoteRail]);

  useEffect(() => {
    if (!isReady || isIntervalLoading || !begin(mount.step)) return;
    void castClaimVote({
      intent: voteIntentStore.read(),
      wallet,
      payout: mount.payout,
      contest: { key: contestKey, target },
      votesCloseMs: votesClose.getTime(),
      priceIntervalSec: priceCurveUpdateInterval || undefined,
      isMounted: () => mountedRef.current,
      cast: (votes, options) => castRef.current(votes, options),
    }).then(outcome => {
      if (mountedRef.current) {
        if (isCurrent(mount.step)) onDone(outcome);
      } else if (!mount.payout && outcome.kind === "failed" && !outcome.isShown) {
        txOverlay.dismiss();
      }
    });
  }, [
    isReady,
    isIntervalLoading,
    mount,
    wallet,
    contestKey,
    target,
    votesClose,
    priceCurveUpdateInterval,
    begin,
    isCurrent,
    onDone,
  ]);

  return null;
};

export default ClaimVoteCaster;
