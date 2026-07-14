import DialogModalV4 from "@components/UI/DialogModalV4";
import Drawer from "@components/UI/Drawer";
import { FC, ReactNode } from "react";
import { useMediaQuery } from "react-responsive";

export enum VoteFlowPresentation {
  Auto = "auto",
  Modal = "modal",
  Drawer = "drawer",
}

interface VoteFlowShellProps {
  isOpen: boolean;
  onClose: () => void;
  presentation?: VoteFlowPresentation;
  children: ReactNode;
}

const VoteFlowShell: FC<VoteFlowShellProps> = ({
  isOpen,
  onClose,
  presentation = VoteFlowPresentation.Auto,
  children,
}) => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const useDrawer =
    presentation === VoteFlowPresentation.Drawer || (presentation === VoteFlowPresentation.Auto && isMobile);

  if (useDrawer) {
    return (
      <Drawer
        isHandleHidden={!isMobile}
        isOpen={isOpen}
        onClose={onClose}
        className="bg-true-black w-full h-auto md:max-w-[550px] m-auto"
      >
        <div className="flex flex-col gap-4 p-6 md:p-8">{children}</div>
      </Drawer>
    );
  }

  return (
    <DialogModalV4 isOpen={isOpen} onClose={onClose} lgWidth="lg:max-w-[528px]" allowsExternalOverlays>
      <div className="flex flex-col bg-true-black gap-4 py-6 md:py-10 px-6 md:px-10">
        <img
          src="/modal/modal_close.svg"
          width={24}
          height={24}
          alt="close"
          className="hidden md:block absolute top-6 right-6 cursor-pointer"
          onClick={onClose}
        />
        {children}
      </div>
    </DialogModalV4>
  );
};

export default VoteFlowShell;
