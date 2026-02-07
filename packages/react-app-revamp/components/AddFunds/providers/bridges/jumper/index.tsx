import AddFundsCard from "@components/AddFunds/components/Card";
import MotionSpinner from "@components/UI/MotionSpinner";
import { getChainId } from "@helpers/getChainId";
import { FC } from "react";
import AddFundsJumperWidget from "./components/Widget";
import useJumperBridgeChains from "./hooks/useJumperBridgeChains";

interface AddFundsJumperProviderProps {
  chain: string;
  asset: string;
}

const JUMPER_PARAMS = {
  name: "jumper exchange",
  description: "0% fees",
  logo: "/add-funds/jumper.svg",
};

const AddFundsJumperProvider: FC<AddFundsJumperProviderProps> = ({ chain, asset }) => {
  const chainId = getChainId(chain);
  const { data: isSupported, isLoading, isError, retry } = useJumperBridgeChains(chainId);

  if (isLoading) {
    return (
      <AddFundsCard {...JUMPER_PARAMS} expanded>
        <MotionSpinner className="my-4 flex items-center justify-center" />
      </AddFundsCard>
    );
  }

  if (isError) {
    return (
      <AddFundsCard {...JUMPER_PARAMS} expanded>
        <p className="text-negative-11 text-[16px] m-4 font-bold">
          ruh roh! we couldn't load jumper,{" "}
          <button className="underline cursor-pointer" onClick={() => retry()}>
            try again!
          </button>
        </p>
      </AddFundsCard>
    );
  }

  if (!isSupported) {
    return <AddFundsCard {...JUMPER_PARAMS} disabled disabledMessage={`not available on ${chain}`} />;
  }

  return (
    <AddFundsCard {...JUMPER_PARAMS}>
      <AddFundsJumperWidget chainId={chainId} asset={asset} />
    </AddFundsCard>
  );
};

export default AddFundsJumperProvider;
