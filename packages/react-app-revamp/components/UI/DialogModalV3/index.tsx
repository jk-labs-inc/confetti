/* eslint-disable react/no-unescaped-entities */
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { FC, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface DialogModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  closeButtonSize?: {
    width: number;
    height: number;
  };
  className?: string;
  isMobile?: boolean;
  disableClose?: boolean;
  disableFocusTrap?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  onClose?: () => void;
}

const DialogModalV3: FC<DialogModalProps> = ({
  isOpen,
  setIsOpen,
  title,
  children,
  onClose,
  isMobile,
  disableClose,
  disableFocusTrap,
  className,
  closeButtonSize = { width: 24, height: 24 },
}) => {
  const handleClose = useCallback(() => {
    setIsOpen?.(false);
    if (onClose) {
      onClose();
    }
  }, [setIsOpen, onClose]);

  if (disableFocusTrap) {
    return (
      <DialogModalPlain
        isOpen={isOpen}
        title={title}
        isMobile={isMobile}
        disableClose={disableClose}
        className={className}
        closeButtonSize={closeButtonSize}
        onClose={handleClose}
      >
        {children}
      </DialogModalPlain>
    );
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 pointer-events-none bg-neutral-8/60" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center 2xs:p-4">
        <div className="flex min-h-full w-full items-center justify-center">
          <DialogPanel
            className={`text-sm mx-auto min-h-screen max-h-screen overflow-y-auto 2xs:min-h-auto 2xs:max-h-[calc(100vh-60px)] w-full px-4 2xs:pt-4 bg-true-black 2xs:rounded-[10px] ${className}`}
          >
            <DialogTitle className="sr-only">{title}</DialogTitle>
            <div className="p-0 md:p-2 relative">
              <button
                onClick={handleClose}
                title="Close this"
                className={`${
                  isMobile || disableClose ? "hidden" : "absolute"
                } z-10 top-0 p-2 left-0 2xs:left-auto 2xs:right-0 pt-4 hover:scale-[1.1] text-neutral-11`}
              >
                <img
                  src="/modal/modal_close.svg"
                  width={closeButtonSize.width}
                  height={closeButtonSize.height}
                  alt="close"
                />
                <span className="sr-only">Close modal</span>
              </button>
              <div className={`${isMobile ? "pt-0" : "pt-3 pb-6"}`}>{children}</div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

interface DialogModalPlainProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  closeButtonSize: { width: number; height: number };
  className?: string;
  isMobile?: boolean;
  disableClose?: boolean;
  onClose: () => void;
}

const DialogModalPlain: FC<DialogModalPlainProps> = ({
  isOpen,
  title,
  children,
  onClose,
  isMobile,
  disableClose,
  className,
  closeButtonSize,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !disableClose) onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (!disableClose && panelRef.current && !panelRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label={title}>
      <div className="fixed inset-0 bg-neutral-8/60" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center 2xs:p-4" onClick={handleBackdropClick}>
        <div className="flex min-h-full w-full items-center justify-center">
          <div
            ref={panelRef}
            className={`text-sm mx-auto min-h-screen max-h-screen overflow-y-auto 2xs:min-h-auto 2xs:max-h-[calc(100vh-60px)] w-full px-4 2xs:pt-4 bg-true-black 2xs:rounded-[10px] ${className ?? ""}`}
          >
            <p className="sr-only">{title}</p>
            <div className="p-0 md:p-2 relative">
              <button
                onClick={onClose}
                title="Close this"
                className={`${
                  isMobile || disableClose ? "hidden" : "absolute"
                } z-10 top-0 p-2 left-0 2xs:left-auto 2xs:right-0 pt-4 hover:scale-[1.1] text-neutral-11`}
              >
                <img
                  src="/modal/modal_close.svg"
                  width={closeButtonSize.width}
                  height={closeButtonSize.height}
                  alt="close"
                />
                <span className="sr-only">Close modal</span>
              </button>
              <div className={`${isMobile ? "pt-0" : "pt-3 pb-6"}`}>{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default DialogModalV3;
