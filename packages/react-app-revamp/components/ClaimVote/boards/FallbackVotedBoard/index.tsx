import { CLAIM_VOTE_IDS } from "@components/ClaimVote/constants";
import { amountText, FALLBACK_TITLE, fallbackVotedBody, VOTED_SHORT_NOTE, votesCastText } from "@components/ClaimVote/copy";
import BoardHero from "@components/XClaim/parts/BoardHero";
import BoardLayout from "@components/XClaim/parts/BoardLayout";
import type { CastVotesResult } from "@hooks/useCastVotes/types";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import { FC } from "react";

interface FallbackVotedBoardProps {
  result: CastVotesResult | null;
  spentNative: string | null;
  onAddFunds: () => void;
}

const FallbackVotedBoard: FC<FallbackVotedBoardProps> = ({ result, spentNative, onAddFunds }) => {
  const nativeSymbol = useContestConfigStore(state => state.contestConfig.chainNativeCurrencySymbol);
  const spent = useDisplayPrice(spentNative ?? "0", nativeSymbol);

  return (
    <BoardLayout
      width="result"
      titleSize="regular"
      hero={<BoardHero art="shy" size={140} />}
      title={FALLBACK_TITLE}
      body={fallbackVotedBody(spentNative ? amountText(spent) : null)}
      note={VOTED_SHORT_NOTE}
      primary={{ kind: "run", id: CLAIM_VOTE_IDS.fallbackAddFunds, label: "add funds", onPress: onAddFunds }}
      secondary={{ role: "alternative", kind: "close", id: CLAIM_VOTE_IDS.fallbackDone, label: "done" }}
    >
      {result && (
        <p id={result.successMeta.id} {...result.successMeta.dataAttributes} className="text-[16px] font-bold">
          {votesCastText(result.amountOfVotes)}
        </p>
      )}
    </BoardLayout>
  );
};

export default FallbackVotedBoard;
