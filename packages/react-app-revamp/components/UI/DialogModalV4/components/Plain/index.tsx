import { Transition, TransitionChild } from "@headlessui/react";
import { FC, MouseEvent, PointerEvent, ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { dialogModalV4BackdropClassName, getDialogModalV4PanelClassName } from "../../styles";

interface DialogModalV4PlainProps {
  isOpen: boolean;
  children: ReactNode;
  width: string;
  lgWidth: string;
  onClose: () => void;
}

const DialogModalV4Plain: FC<DialogModalV4PlainProps> = ({ isOpen, children, width, lgWidth, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const isPointerDownOutside = useRef(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  const isOutside = (target: EventTarget | null) => !panelRef.current?.contains(target as Node);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    isPointerDownOutside.current = isOutside(event.target);
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (isPointerDownOutside.current && isOutside(event.target)) onClose();
  };

  return createPortal(
    <Transition as="div" show={isOpen} className="relative z-50">
      <TransitionChild as="div" transition aria-hidden="true" className={dialogModalV4BackdropClassName} />

      <div
        className="fixed inset-0 z-50 w-screen overflow-y-auto"
        onPointerDown={handlePointerDown}
        onClick={handleClick}
      >
        <div className="flex min-h-full items-end justify-center text-center lg:items-center p-0">
          <TransitionChild
            as="div"
            transition
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            className={getDialogModalV4PanelClassName(width, lgWidth)}
          >
            <div className="lg:pb-0 lg:p-6">{children}</div>
          </TransitionChild>
        </div>
      </div>
    </Transition>,
    document.body,
  );
};

export default DialogModalV4Plain;
