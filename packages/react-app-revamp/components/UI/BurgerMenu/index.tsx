import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { Fragment, useRef, useState } from "react";
import ReactDOM from "react-dom";

type BurgerMenuProps = {
  children: React.ReactNode;
  className?: string;
  iconClassName?: string;
  onOpen?: () => void;
  onClose?: () => void;
};

const BurgerMenu = ({ children, className, iconClassName = "h-8 w-8", onOpen, onClose }: BurgerMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const initialFocusRef = useRef(null);

  const onMenuOpen = () => {
    setIsOpen(true);
    onOpen?.();
  };

  const onMenuClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const menuContent = (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 overflow-hidden"
        style={{ zIndex: 9999 }}
        onClose={() => setIsOpen(false)}
        initialFocus={initialFocusRef}
      >
        <div tabIndex={-1} ref={initialFocusRef} />
        <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 9999 }}>
          <TransitionChild
            as={Fragment}
            enter="ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in-out duration-300"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <div
              className="pointer-events-auto fixed inset-y-0 right-0 flex max-w-full pl-10 bg-true-black"
              style={{ zIndex: 9999 }}
            >
              <DialogPanel className={`w-screen max-w-md transform transition ease-in-out duration-300 ${className}`}>
                <div className="flex h-full flex-col overflow-y-scroll bg-true-black shadow-xl">
                  <div className="mt-24 relative flex-1">{children}</div>
                  <div className="absolute top-2 right-0 pt-4 pr-6">
                    <button type="button" onClick={onMenuClose}>
                      <span className="sr-only">Close</span>
                      <img src="/modal/modal_close.svg" width={32} height={32} alt="close" />
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </div>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );

  return (
    <>
      <Bars3Icon className={iconClassName} onClick={onMenuOpen} aria-label="Open menu" />
      {typeof window !== "undefined" && ReactDOM.createPortal(menuContent, document.body)}
    </>
  );
};

export default BurgerMenu;
