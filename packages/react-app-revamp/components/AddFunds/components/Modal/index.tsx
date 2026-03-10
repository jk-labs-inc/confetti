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
    <DialogModalV4 isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col bg-true-black z-40 gap-4 py-6 md:py-16 px-6 md:pl-32 md:pr-16">
        <div className="hidden md:flex justify-between items-start">
          <img
            src="/modal/modal_close.svg"
            width={33}
            height={33}
            alt="close"
            className="hidden md:block cursor-pointer ml-auto"
            onClick={onClose}
          />
        </div>
        <AddFunds className="md:w-[400px]" chain={chain} asset={asset} showBackButton={false} onCloseModal={onClose} />
      </div>
    </DialogModalV4>
  );
};

export default AddFundsModal;
