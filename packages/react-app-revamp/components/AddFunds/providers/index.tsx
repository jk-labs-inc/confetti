import { FC } from "react";
import AddFundsJumperProvider from "./bridges/jumper";
import AddFundsOnrampProvider from "./onramp";

export enum AddFundsProviderType {
  BRIDGE = "bridge",
  ONRAMP = "onramp",
}

interface AddFundsProvidersProps {
  type: AddFundsProviderType;
  chain: string;
  asset: string;
  onCloseModal?: () => void;
  onrampDisabled?: boolean;
}

const DESCRIPTIONS: Record<AddFundsProviderType, string> = {
  [AddFundsProviderType.ONRAMP]: "add cash and play",
  [AddFundsProviderType.BRIDGE]: "fund from another chain",
};

const SECONDARY_TEXT: Record<AddFundsProviderType, string> = {
  [AddFundsProviderType.ONRAMP]: "(defaults to $5, or edit to add more)",
  [AddFundsProviderType.BRIDGE]: "",
};

const AddFundsProviders: FC<AddFundsProvidersProps> = ({
  type,
  chain,
  asset,
  onCloseModal,
  onrampDisabled = false,
}) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <p className="text-neutral-11 text-[16px] font-bold">
        {DESCRIPTIONS[type]}
        {SECONDARY_TEXT[type] && <span className="text-neutral-9 ml-2 font-bold">{SECONDARY_TEXT[type]}</span>}
      </p>
      {type === AddFundsProviderType.ONRAMP ? (
        <AddFundsOnrampProvider chain={chain} onCloseModal={onCloseModal} disabled={onrampDisabled} />
      ) : (
        <AddFundsJumperProvider chain={chain} asset={asset} />
      )}
    </div>
  );
};

export default AddFundsProviders;
