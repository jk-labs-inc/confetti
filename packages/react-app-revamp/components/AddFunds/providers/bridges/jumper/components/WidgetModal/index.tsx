import DialogModalV4 from "@components/UI/DialogModalV4";
import { FC } from "react";
import { JUMPER_PARAMS, JUMPER_WIDGET_MODAL_LG_WIDTH_CLASS_NAME } from "../../constants";
import AddFundsJumperWidget from "../Widget";

interface AddFundsJumperWidgetModalProps {
  isOpen: boolean;
  chainId: number;
  asset: string;
  onClose: () => void;
  onBridgeSuccess?: () => void;
}

const AddFundsJumperWidgetModal: FC<AddFundsJumperWidgetModalProps> = ({
  isOpen,
  chainId,
  asset,
  onClose,
  onBridgeSuccess,
}) => {
  const handleBridgeSuccess = () => {
    onClose();
    onBridgeSuccess?.();
  };

  return (
    <DialogModalV4
      isOpen={isOpen}
      onClose={onClose}
      lgWidth={JUMPER_WIDGET_MODAL_LG_WIDTH_CLASS_NAME}
      allowsExternalOverlays
    >
      <div className="flex flex-col gap-4 bg-true-black p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={JUMPER_PARAMS.logo} alt="" className="h-8 w-8" />
            <p className="text-[20px] font-bold text-neutral-11">{JUMPER_PARAMS.name}</p>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 cursor-pointer" aria-label="close">
            <img src="/modal/modal_close.svg" width={24} height={24} alt="" />
          </button>
        </div>
        <AddFundsJumperWidget chainId={chainId} asset={asset} onBridgeSuccess={handleBridgeSuccess} />
      </div>
    </DialogModalV4>
  );
};

export default AddFundsJumperWidgetModal;
