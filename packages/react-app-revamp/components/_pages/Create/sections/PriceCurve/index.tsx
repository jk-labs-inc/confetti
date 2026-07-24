import { chains } from "@config/wagmi";
import useChargeDetails from "@hooks/useChargeDetails";
import { useWallet } from "@hooks/useWallet";
import { useMediaQuery } from "react-responsive";
import CreateConnectPrompt from "../../components/ConnectPrompt";
import CreateTextContainer from "../../components/TextContainer";
import PriceCurveMultiplerPreview from "./components/PriceCurveMultiplerPreview";
import PriceCurveTypeSelector from "./components/PriceCurveTypeSelector";

const CreateContestPriceCurveSection = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const { isConnected, chain } = useWallet();
  const chainName = chain?.name.toLowerCase() ?? "";
  const chainUnitLabel = chains.find(c => c.name.toLowerCase() === chainName)?.nativeCurrency.symbol;
  const { isError, refetch: refetchChargeDetails, isLoading } = useChargeDetails(chainName);

  if (!isConnected) {
    return <CreateConnectPrompt />;
  }

  if (isError) {
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
    <div className="flex flex-col gap-8">
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
      <PriceCurveMultiplerPreview chainUnitLabel={chainUnitLabel} />
    </div>
  );
};

export default CreateContestPriceCurveSection;
