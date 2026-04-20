import { useMemo } from "react";
import AddFundsJumperProvider from "../bridges/jumper";
import AddFundsCoinbaseProvider from "../onramp/coinbase";
import AddFundsParaProvider from "../onramp";
import { AddFundsProviderType } from "../../types";

interface UseAddFundsProvidersParams {
  type: AddFundsProviderType;
  chain: string;
  asset: string;
  onCloseModal?: () => void;
  onBridgeSuccess?: () => void;
}

const useAddFundsProviders = ({ type, chain, asset, onCloseModal, onBridgeSuccess }: UseAddFundsProvidersParams) => {
  const providers = useMemo(() => {
    switch (type) {
      case AddFundsProviderType.ONRAMP:
        return [
          <AddFundsCoinbaseProvider key="coinbase" chain={chain} asset={asset} />,
          <AddFundsParaProvider key="para" chain={chain} onCloseModal={onCloseModal} />,
        ];
      case AddFundsProviderType.BRIDGE:
        return [<AddFundsJumperProvider key="jumper" chain={chain} asset={asset} onBridgeSuccess={onBridgeSuccess} />];
      default:
        return [];
    }
  }, [type, chain, asset, onCloseModal, onBridgeSuccess]);

  return providers;
};

export default useAddFundsProviders;
