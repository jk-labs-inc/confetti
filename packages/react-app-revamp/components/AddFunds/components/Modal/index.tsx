import AddFunds from "@components/AddFunds";
import DialogModalV4 from "@components/UI/DialogModalV4";
import { FC } from "react";

interface AddFundsModalProps {
  chain: string;
  asset: string;
  isOpen: boolean;
  onClose: () => void;
}

const AddFundsModal: FC<AddFundsModalProps> = ({ chain, asset, isOpen, onClose }) => {
  return (
    <DialogModalV4 isOpen={isOpen} onClose={onClose} lgWidth="lg:max-w-[528px]">
      <div className="flex flex-col bg-true-black z-40 gap-4 py-6 md:py-10 px-6 md:px-10">
        <img
          src="/modal/modal_close.svg"
          width={24}
          height={24}
          alt="close"
          className="hidden md:block absolute top-6 right-6 cursor-pointer"
          onClick={onClose}
        />
        <AddFunds className="md:w-[400px]" chain={chain} asset={asset} showBackButton={false} onCloseModal={onClose} />
      </div>
    </DialogModalV4>
  );
};

export default AddFundsModal;
