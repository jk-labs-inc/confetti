import DialogModalV4 from "@components/UI/DialogModalV4";
import Drawer from "@components/UI/Drawer";
import { FC, ReactNode, useEffect, useRef } from "react";
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

/** oerlays that portal outside the dialog panel — a click inside them isn't an outside-click. */
const DISMISS_BLOCKING_OVERLAYS = "cpsl-auth-modal, .Toastify";

const VoteFlowShell: FC<VoteFlowShellProps> = ({
  isOpen,
  onClose,
  presentation = VoteFlowPresentation.Auto,
  children,
}) => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const useDrawer =
    presentation === VoteFlowPresentation.Drawer || (presentation === VoteFlowPresentation.Auto && isMobile);
  const lastPointerDownTarget = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const capturePointerDown = (event: PointerEvent) => {
      lastPointerDownTarget.current = event.target as HTMLElement | null;
    };
    const clearOnKeyDown = () => {
      lastPointerDownTarget.current = null;
    };

    document.addEventListener("pointerdown", capturePointerDown, true);
    document.addEventListener("keydown", clearOnKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", capturePointerDown, true);
      document.removeEventListener("keydown", clearOnKeyDown, true);
    };
  }, [isOpen]);

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

  const handleModalClose = () => {
    if (lastPointerDownTarget.current?.closest?.(DISMISS_BLOCKING_OVERLAYS)) return;
    onClose();
  };

  return (
    <DialogModalV4 isOpen={isOpen} onClose={handleModalClose} lgWidth="lg:max-w-[528px]">
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
