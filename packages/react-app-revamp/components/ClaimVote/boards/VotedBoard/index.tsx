import { CLAIM_VOTE_IDS } from "@components/ClaimVote/constants";
import {
  amountText,
  VOTED_SHORT_NOTE,
  VOTED_SHORT_TITLE,
  VOTED_TITLE,
  votedBody,
  votedShortBody,
  votesCastText,
} from "@components/ClaimVote/copy";
import BoardHero from "@components/XClaim/parts/BoardHero";
import BoardLayout from "@components/XClaim/parts/BoardLayout";
import type { CastVotesResult } from "@hooks/useCastVotes/types";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import { FC } from "react";

interface VotedBoardProps {
  result: CastVotesResult | null;
  spentNative: string | null;
  wantedNative: string | null;
  onAddFunds: () => void;
}

const DONE_BUTTON = { kind: "close", id: CLAIM_VOTE_IDS.votedDone, label: "done" } as const;

const VotedBoard: FC<VotedBoardProps> = ({ result, spentNative, wantedNative, onAddFunds }) => {
  const nativeSymbol = useContestConfigStore(state => state.contestConfig.chainNativeCurrencySymbol);
  const spent = useDisplayPrice(spentNative ?? "0", nativeSymbol);
  const wanted = useDisplayPrice(wantedNative ?? "0", nativeSymbol);

  return (
    <BoardLayout
      width="result"
      titleSize="large"
      spacing="roomy"
      hero={<BoardHero art="money" size={220} coin />}
      title={wantedNative ? VOTED_SHORT_TITLE : VOTED_TITLE}
      body={
        wantedNative
          ? votedShortBody({ wanted: amountText(wanted), spent: amountText(spent) })
          : votedBody(spentNative ? amountText(spent) : null)
      }
      note={wantedNative ? VOTED_SHORT_NOTE : undefined}
      primary={
        wantedNative
          ? { kind: "run", id: CLAIM_VOTE_IDS.votedAddFunds, label: "add funds", onPress: onAddFunds }
          : DONE_BUTTON
      }
      secondary={wantedNative ? { role: "alternative", ...DONE_BUTTON } : undefined}
    >
      {result && (
        <p id={result.successMeta.id} {...result.successMeta.dataAttributes} className="text-[16px] font-bold">
          {votesCastText(result.amountOfVotes)}
        </p>
      )}
    </BoardLayout>
  );
};

export default VotedBoard;
