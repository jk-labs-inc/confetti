import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { FC } from "react";
import DialogModalV4Plain from "./components/Plain";
import { dialogModalV4BackdropClassName, getDialogModalV4PanelClassName } from "./styles";

interface DialogModalV4Props {
  isOpen: boolean;
  children: React.ReactNode;
  onClose: (value: boolean) => void;
  width?: string;
  lgWidth?: string;
  allowsExternalOverlays?: boolean;
}

const DialogModalV4: FC<DialogModalV4Props> = ({
  isOpen,
  onClose,
  children,
  width = "w-full",
  lgWidth = "lg:max-w-[1024px]",
  allowsExternalOverlays,
}) => {
  if (allowsExternalOverlays) {
    return (
      <DialogModalV4Plain isOpen={isOpen} onClose={() => onClose(false)} width={width} lgWidth={lgWidth}>
        {children}
      </DialogModalV4Plain>
    );
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop transition className={dialogModalV4BackdropClassName} />

      <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center text-center lg:items-center p-0">
          <DialogPanel transition className={getDialogModalV4PanelClassName(width, lgWidth)}>
            <div className="lg:pb-0 lg:p-6">{children}</div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default DialogModalV4;
