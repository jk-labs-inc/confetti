import { FC } from "react";
import { AddFundsProviderType } from "../types";
import useAddFundsProviders from "./hooks/useAddFundsProviders";

export { AddFundsProviderType };

interface AddFundsProvidersProps {
  type: AddFundsProviderType;
  chain: string;
  asset: string;
  onCloseModal?: () => void;
  onBridgeSuccess?: () => void;
}

const OnrampDescription = () => (
  <p className="text-base text-neutral-11">what's your region? this determines the tool to add funds.</p>
);

const BridgeDescription = ({ chain }: { chain: string }) => (
  <p className="text-neutral-11 text-base">fund from another chain into {chain}</p>
);

const AddFundsProviders: FC<AddFundsProvidersProps> = ({ type, chain, asset, onCloseModal, onBridgeSuccess }) => {
  const providers = useAddFundsProviders({ type, chain, asset, onCloseModal, onBridgeSuccess });

  return (
    <div className="flex flex-col gap-6 w-full">
      {type === AddFundsProviderType.ONRAMP ? <OnrampDescription /> : <BridgeDescription chain={chain} />}
      <div className="flex flex-col gap-4">{providers}</div>
    </div>
  );
};

export default AddFundsProviders;
