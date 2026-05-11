import { chains } from "@config/wagmi";
import useChargeDetails from "@hooks/useChargeDetails";
import { FC } from "react";
import PriceCurveMultiplerPreview from "./components/PriceCurveMultiplerPreview";
import PriceCurveTypeSelector from "./components/PriceCurveTypeSelector";
import { useMediaQuery } from "react-responsive";
import CreateTextContainer from "@components/_pages/Create/components/TextContainer";
import CreateContestCreatorSplitToggle from "../CreatorSplitToggle";

interface CreateContestPriceCurveProps {
  chain: string;
  onError?: (value: boolean) => void;
}

const CreateContestPriceCurve: FC<CreateContestPriceCurveProps> = ({ chain, onError }) => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const chainUnitLabel = chains.find(c => c.name.toLowerCase() === chain.toLowerCase())?.nativeCurrency.symbol;
  const { isError, refetch: refetchChargeDetails, isLoading } = useChargeDetails(chain);

  if (isError) {
    onError?.(true);
    return (
      <p className="text-[20px] text-negative-11 font-bold">
        ruh roh, we couldn't load charge details for this chain!{" "}
        <button className="underline cursor-pointer" onClick={() => refetchChargeDetails()}>
          please try again
        </button>
      </p>
    );
  }

  if (isLoading) {
    return <p className="loadingDots font-sabo-filled text-[20px] text-neutral-9">Loading charge fees</p>;
  }

  return (
    <div className="flex flex-col gap-12">
      <CreateTextContainer>
        <p>
          players pay per vote on a price curve. 90% of their funds {isMobile ? "" : <br />}
          go into the rewards pool. players claim their share of the {isMobile ? "" : <br />}
          rewards by voting on the winner(s).
        </p>
        <p>
          the price curve incentivizes players to vote early with {isMobile ? "" : <br />}
          conviction to earn more.
        </p>
      </CreateTextContainer>
      <PriceCurveTypeSelector />
      <PriceCurveMultiplerPreview chainUnitLabel={chainUnitLabel} onError={onError} />
      <CreateContestCreatorSplitToggle />
    </div>
  );
};

export default CreateContestPriceCurve;
