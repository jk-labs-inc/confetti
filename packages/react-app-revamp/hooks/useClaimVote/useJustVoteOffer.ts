import { amountText, ownVoteNote } from "@components/ClaimVote/copy";
import type { XClaimJustVote } from "@components/XClaim/board";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useVoteCurrencyDisplayPrice from "@hooks/useCurrency/useVoteCurrencyDisplayPrice";
import useVoteCurrencyUsdRate from "@hooks/useCurrency/useVoteCurrencyUsdRate";
import { ownVoteNative, totalWithCredit } from "lib/claimVote/sizing";
import type { VoteIntent } from "lib/claimVote/types";

export const useJustVoteOffer = ({
  intent,
  creditUsd,
  onPress,
}: {
  intent: VoteIntent | null;
  creditUsd: string | null;
  onPress: () => void;
}): XClaimJustVote | null => {
  const voteCurrency = useContestConfigStore(state => state.contestConfig.voteCurrency);
  const { rate: voteCurrencyUsdRate } = useVoteCurrencyUsdRate(voteCurrency);
  const amountNative = intent ? ownVoteNative(intent) : "0";
  const totalNative = totalWithCredit({
    amountNative,
    creditUsd,
    nativeUsdRate: voteCurrencyUsdRate,
  });
  const own = useVoteCurrencyDisplayPrice(amountNative, voteCurrency);
  const total = useVoteCurrencyDisplayPrice(totalNative ?? "0", voteCurrency);

  if (!intent) return null;
  return {
    onPress,
    note: ownVoteNote(intent.entryTitle),
    ownAmount: amountText(own),
    totalAmount: totalNative ? amountText(total) : null,
  };
};
