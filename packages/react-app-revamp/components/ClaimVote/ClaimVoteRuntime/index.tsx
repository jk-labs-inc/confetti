"use client";

import ClaimVoteCaster from "@components/ClaimVote/ClaimVoteCaster";
import { useModal } from "@getpara/react-sdk-lite";
import { useClaimVoteDriver } from "@hooks/useClaimVote/useClaimVoteDriver";
import { useJustVoteOffer } from "@hooks/useClaimVote/useJustVoteOffer";
import { CastVotesWrapper } from "@hooks/useCastVotes/store";
import { useEmbeddedOnlySignIn } from "@hooks/useParaSignIn";
import { xClaimKeys } from "@hooks/useXClaim/queries";
import { useQueryClient } from "@tanstack/react-query";
import { claimVoteModalView, finishablePayout, ownVoteIntent } from "lib/claimVote/view";
import type { XClaimActions } from "lib/xClaim/types";
import { walletAddressOf } from "lib/xClaim/wallet";
import dynamic from "next/dynamic";
import { FC, useCallback, useMemo } from "react";

const ClaimVoteModal = dynamic(() => import("@components/ClaimVote/ClaimVoteModal"), { ssr: false });

const ClaimVoteRuntime: FC = () => {
  const { run, modalOpen, facts, caster, contest, dispatch, finishVote } = useClaimVoteDriver();
  const { openModal } = useModal();
  const createAccount = useEmbeddedOnlySignIn();
  const queryClient = useQueryClient();
  const view = useMemo(() => claimVoteModalView({ run, facts }), [run, facts]);
  const ownVote = ownVoteIntent({ run, facts, now: Date.now() });
  const finishPayout = run.phase === "vote_failed" ? finishablePayout(facts, Date.now()) : null;
  const address = walletAddressOf(facts.wallet);

  const actions = useMemo(
    (): XClaimActions => ({
      open: () => dispatch({ type: "reopen" }),
      close: () => dispatch({ type: "close" }),
      signIn: () => openModal(),
      createAccount,
      startXClaim: async () =>
        dispatch(run.phase === "verify_x" ? { type: "verify" } : { type: "retry", via: "x_redirect" }),
      retryClaim: async () => dispatch({ type: "retry", via: "worker" }),
      checkStatus: async () => {
        if (address) await queryClient.refetchQueries({ queryKey: xClaimKeys.me(address) });
      },
    }),
    [run.phase, address, openModal, createAccount, queryClient, dispatch],
  );

  const voteOwnFunds = () =>
    dispatch(ownVoteIntent({ run, facts, now: Date.now() }) ? { type: "just_vote" } : { type: "close" });
  const onFinish = finishPayout ? () => dispatch({ type: "finish", payout: finishPayout }) : null;
  const justVote = useJustVoteOffer({
    intent: ownVote,
    creditUsd: facts.spots?.usdAmount ?? null,
    onPress: voteOwnFunds,
  });
  const onRetryCheck = useCallback(() => dispatch({ type: "retry", via: null }), [dispatch]);

  return (
    <>
      <ClaimVoteModal
        isOpen={modalOpen}
        view={view}
        actions={actions}
        onFinish={onFinish}
        justVote={justVote}
        onRetryCheck={onRetryCheck}
      />
      {caster && (
        <CastVotesWrapper
          key={`${caster.intent.wallet}:${caster.intent.proposalId}`}
          initialPickedProposal={caster.intent.proposalId}
        >
          <ClaimVoteCaster
            mount={caster}
            target={contest}
            contestKey={facts.contest}
            wallet={facts.wallet}
            onDone={finishVote}
          />
        </CastVotesWrapper>
      )}
    </>
  );
};

export default ClaimVoteRuntime;
