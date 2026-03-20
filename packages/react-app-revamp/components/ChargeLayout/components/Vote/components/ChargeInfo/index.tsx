import MiniPriceCurveWrapper from "@components/MiniPriceCurve/wrapper";
import { FC } from "react";

interface ChargeInfoProps {
  costToVote: string;
  costToVoteRaw: bigint;
}

const ChargeInfo: FC<ChargeInfoProps> = () => {
  return <MiniPriceCurveWrapper height={110} showPriceWarning />;
};

export default ChargeInfo;
