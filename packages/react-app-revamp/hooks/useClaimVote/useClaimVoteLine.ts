import { usePickedEntryPreview } from "@components/Voting/hooks/usePickedEntryPreview";
import { useVotingStore } from "@components/Voting/store";
import { useCastVotesStore } from "@hooks/useCastVotes/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useNativeRates from "@hooks/useCurrency/useNativeRates";
import { offerKey } from "lib/claimVote/intent";
import { creditGate } from "lib/claimVote/sizing";
import type { ClaimVoteLine } from "lib/claimVote/types";
import { claimVoteLine } from "lib/claimVote/view";
import { walletAddressOf } from "lib/xClaim/wallet";
import { useCallback } from "react";
import { useShallow } from "zustand/shallow";
import { useClaimVoteStore, useHasClaimVoteRun } from "./store";
import { useClaimVoteFacts } from "./useClaimVoteFacts";

const HIDDEN_LINE: ClaimVoteLine = { kind: "hidden" };

export const useClaimVoteLine = ({
  pricePerVoteNative,
  isVotingClosed,
}: {
  pricePerVoteNative: string;
  isVotingClosed: boolean;
}) => {
  const hasRun = useHasClaimVoteRun();
  const { run, declinedOffer, dispatch } = useClaimVoteStore(
    useShallow(state => ({ run: state.run, declinedOffer: state.declinedOffer, dispatch: state.dispatch })),
  );
  const facts = useClaimVoteFacts({ enabled: hasRun, pollUntil: null });
  const nativeSymbol = useContestConfigStore(state => state.contestConfig.chainNativeCurrencySymbol);
  const { data: nativeRates } = useNativeRates();
  const pickedProposal = useCastVotesStore(state => state.pickedProposal);
  const { title } = usePickedEntryPreview();

  const gate = creditGate({
    creditUsd: facts.spots?.usdAmount ?? null,
    nativeUsdRate: nativeSymbol ? nativeRates?.[nativeSymbol.toLowerCase()] : undefined,
    pricePerVoteNative,
  });
  const derived = hasRun ? claimVoteLine({ run, facts, gate }) : HIDDEN_LINE;
  const address = walletAddressOf(facts.wallet);
  const isDeclined = address !== null && declinedOffer === offerKey({ wallet: address, contest: facts.contest });
  const line = derived.kind === "offer" && (!pickedProposal || isVotingClosed || isDeclined) ? HIDDEN_LINE : derived;

  const press = useCallback(() => {
    if (line.kind !== "offer" || !pickedProposal) return;
    dispatch({
      type: "start",
      choice: {
        proposalId: pickedProposal,
        entryTitle: title ?? "",
        amountNative: useVotingStore.getState().inputValue,
      },
    });
  }, [line.kind, pickedProposal, title, dispatch]);

  return { line, press, isBusy: line.kind === "busy" };
};
