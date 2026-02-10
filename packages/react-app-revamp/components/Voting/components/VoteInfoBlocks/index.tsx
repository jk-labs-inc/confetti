import ChargeInfo from "@components/ChargeLayout/components/Vote/components/ChargeInfo";
import MyVotes from "@components/ChargeLayout/components/Vote/components/MyVotes";
import TotalVotes from "@components/Voting/components/TotalVotes";
import { FC } from "react";
import { VoteInfoBlocksProps } from "./types";

const VoteInfoBlocks: FC<VoteInfoBlocksProps> = props => {
  switch (props.type) {
    case "my-votes":
      return (
        <MyVotes
          isConnected={props.isConnected}
          balance={props.balance}
          symbol={props.symbol}
          insufficientBalance={props.insufficientBalance}
          onAddFunds={props.onAddFunds}
        />
      );
    case "charge-info":
      return <ChargeInfo costToVote={props.costToVote} costToVoteRaw={props.costToVoteRaw} />;
    case "total-votes":
      return <TotalVotes costToVote={props.costToVote} spendableBalance={props.spendableBalance} />;
    default:
      return null;
  }
};

export default VoteInfoBlocks;
