import AddFunds from "@components/AddFunds";
import Drawer from "@components/UI/Drawer";
import { FC } from "react";

interface SubmissionPageMobileAddFundsProps {
  isOpen: boolean;
  onClose: () => void;
  chain: string;
  asset: string;
}

const SubmissionPageMobileAddFunds: FC<SubmissionPageMobileAddFundsProps> = ({ isOpen, onClose, chain, asset }) => {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} className="bg-true-black w-full h-auto">
      <div className="p-6 pb-4">
        <AddFunds chain={chain} asset={asset} showBackButton={false} />
      </div>
    </Drawer>
  );
};

export default SubmissionPageMobileAddFunds;
