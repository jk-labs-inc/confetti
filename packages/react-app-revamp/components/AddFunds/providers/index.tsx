import { FC, ReactNode } from "react";
import useAddFundsProviders from "./hooks/useAddFundsProviders";
import { AddFundsProviderType } from "../types";

export { AddFundsProviderType };

interface AddFundsProvidersProps {
  type: AddFundsProviderType;
  chain: string;
  asset: string;
}

const OnrampDescription = () => (
  <p className="text-base">
    <span className="text-neutral-11 font-bold">add cash and play</span>{" "}
    <span className="text-neutral-9 font-bold">(defaults to $5, or edit to add more)</span>
  </p>
);

const BridgeDescription = () => <p className="text-neutral-11 text-base font-bold">fund from another chain</p>;

const PROVIDER_DESCRIPTIONS: Record<AddFundsProviderType, ReactNode> = {
  [AddFundsProviderType.ONRAMP]: <OnrampDescription />,
  [AddFundsProviderType.BRIDGE]: <BridgeDescription />,
};

const AddFundsProviders: FC<AddFundsProvidersProps> = ({ type, chain, asset }) => {
  const providers = useAddFundsProviders({ type, chain, asset });

  return (
    <div className="flex flex-col gap-4 w-full">
      {PROVIDER_DESCRIPTIONS[type]}
      {providers}
    </div>
  );
};

export default AddFundsProviders;
