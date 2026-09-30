import AddFundsCard from "@components/AddFunds/components/Card";
import { useIsNarrowContainer } from "@components/AddFunds/useIsNarrowContainer";
import MotionSpinner from "@components/UI/MotionSpinner";
import { getChainId } from "@helpers/getChainId";
import { MOBILE_MAX_WIDTH_PX } from "@helpers/isMobileViewport";
import { FC, useState } from "react";
import { useMediaQuery } from "react-responsive";
import AddFundsJumperWidget from "./components/Widget";
import AddFundsJumperWidgetModal from "./components/WidgetModal";
import { JUMPER_PARAMS } from "./constants";
import useJumperBridgeChains from "./hooks/useJumperBridgeChains";

interface AddFundsJumperProviderProps {
  chain: string;
  asset: string;
  onBridgeSuccess?: () => void;
}

const AddFundsJumperProvider: FC<AddFundsJumperProviderProps> = ({ chain, asset, onBridgeSuccess }) => {
  const chainId = getChainId(chain);
  const { data: isSupported, isLoading, isError, retry } = useJumperBridgeChains(chainId);
  const { ref, isNarrow } = useIsNarrowContainer<HTMLDivElement>();
  const isMobile = useMediaQuery({ maxWidth: MOBILE_MAX_WIDTH_PX });
  const opensInModal = isNarrow && !isMobile;
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);

  const renderCard = () => {
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

    if (opensInModal) {
      return <AddFundsCard {...JUMPER_PARAMS} onClick={() => setIsWidgetModalOpen(true)} />;
    }

    return (
      <AddFundsCard {...JUMPER_PARAMS}>
        <AddFundsJumperWidget chainId={chainId} asset={asset} onBridgeSuccess={onBridgeSuccess} />
      </AddFundsCard>
    );
  };

  return (
    <div ref={ref}>
      {renderCard()}
      <AddFundsJumperWidgetModal
        isOpen={isWidgetModalOpen}
        chainId={chainId}
        asset={asset}
        onClose={() => setIsWidgetModalOpen(false)}
        onBridgeSuccess={onBridgeSuccess}
      />
    </div>
  );
};

export default AddFundsJumperProvider;
