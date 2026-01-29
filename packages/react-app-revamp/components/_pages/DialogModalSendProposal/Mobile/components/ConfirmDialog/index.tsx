import { Charge } from "@hooks/useDeployContest/types";
import { useSubmitProposalStore } from "@hooks/useSubmitProposal/store";
import { type GetBalanceReturnType } from "@wagmi/core";
import { FC, useState } from "react";
import SendProposalMobileLayoutConfirmInitialContent from "./components/InitialContent";
import SendProposalMobileLayoutConfirmLoadingContent from "./components/LoadingContent";

interface DialogModalSendProposalMobileLayoutConfirmProps {
  chainName: string;
  isOpen?: boolean;
  charge: Charge;
  accountData: GetBalanceReturnType | undefined;
  onConfirm?: () => void;
  onClose?: () => void;
}

const DialogModalSendProposalMobileLayoutConfirm: FC<DialogModalSendProposalMobileLayoutConfirmProps> = ({
  chainName,
  isOpen,
  charge,
  accountData,
  onConfirm,
  onClose,
}) => {
  const { isLoading } = useSubmitProposalStore(state => state);
  const [showAddFunds, setShowAddFunds] = useState(false);

  const title = isLoading ? "approving transaction..." : "submit entry";

  if (!isOpen) return null;

  const renderContent = () => {
    if (isLoading) return <SendProposalMobileLayoutConfirmLoadingContent />;
    return (
      <SendProposalMobileLayoutConfirmInitialContent
        onConfirm={onConfirm}
        charge={charge}
        accountData={accountData}
        chainName={chainName}
        onShowAddFunds={setShowAddFunds}
      />
    );
  };

  return (
    <div className="fixed z-50 left-0 right-0 bottom-0 bg-true-black w-full border-t border-neutral-9 rounded-t-[40px] animate-appear pl-10 pr-8 pt-8 pb-4">
      <div className="flex flex-col gap-5 transition-all">
        <div className="flex justify-between items-center">
          {!showAddFunds ? <p className="text-[24px] font-bold">{title}</p> : null}
          {!showAddFunds ? (
            <img src="/modal/modal_close.svg" width={24} height={24} alt="close" onClick={onClose} />
          ) : null}
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default DialogModalSendProposalMobileLayoutConfirm;
