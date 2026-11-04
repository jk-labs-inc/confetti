import { amountText, ownVoteNote } from "@components/ClaimVote/copy";
import type { XClaimJustVote } from "@components/XClaim/board";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import useNativeRates from "@hooks/useCurrency/useNativeRates";
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
  const nativeSymbol = useContestConfigStore(state => state.contestConfig.chainNativeCurrencySymbol);
  const { data: nativeRates } = useNativeRates();
  const amountNative = intent ? ownVoteNative(intent) : "0";
  const totalNative = totalWithCredit({
    amountNative,
    creditUsd,
    nativeUsdRate: nativeRates?.[nativeSymbol.toLowerCase()],
  });
  const own = useDisplayPrice(amountNative, nativeSymbol);
  const total = useDisplayPrice(totalNative ?? "0", nativeSymbol);

  if (!intent) return null;
  return {
    onPress,
    note: ownVoteNote(intent.entryTitle),
    ownAmount: amountText(own),
    totalAmount: totalNative ? amountText(total) : null,
  };
};
