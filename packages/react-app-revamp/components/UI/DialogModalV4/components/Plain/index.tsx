import { Transition, TransitionChild } from "@headlessui/react";
import { isParaModalShown } from "@helpers/paraModal";
import { FC, MouseEvent, PointerEvent, ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  dialogModalV4BackdropClassName,
  dialogModalV4LayerClassName,
  getDialogModalV4PanelClassName,
} from "../../styles";
import type { DialogModalV4Layer, DialogModalV4Panel } from "../../types";

interface DialogModalV4PlainProps {
  isOpen: boolean;
  children: ReactNode;
  width: string;
  lgWidth: string;
  panel: DialogModalV4Panel;
  layer: DialogModalV4Layer;
  onClose: () => void;
}

const DialogModalV4Plain: FC<DialogModalV4PlainProps> = ({
  isOpen,
  children,
  width,
  lgWidth,
  panel,
  layer,
  onClose,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const isPointerDownOutside = useRef(false);
  const [isMounted, setIsMounted] = useState(false);
  const isTopLayer = layer === "top";

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || isParaModalShown()) return;
      if (isTopLayer) event.stopPropagation();
      onClose();
    };

    const isBodyScrollLockedBelow = isTopLayer && document.body.style.overflow === "hidden";

    if (isTopLayer) window.addEventListener("keydown", handleKeyDown, { capture: true });
    else document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      if (isTopLayer) window.removeEventListener("keydown", handleKeyDown, { capture: true });
      else document.removeEventListener("keydown", handleKeyDown);
      if (!isBodyScrollLockedBelow) document.body.style.overflow = "";
    };
  }, [isOpen, onClose, isTopLayer]);

  if (!isMounted) return null;

  const isOutside = (target: EventTarget | null) => !panelRef.current?.contains(target as Node);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    isPointerDownOutside.current = isOutside(event.target);
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (isPointerDownOutside.current && isOutside(event.target)) onClose();
  };

  return createPortal(
    <Transition as="div" show={isOpen} appear={isTopLayer} className={`relative ${dialogModalV4LayerClassName[layer]}`}>
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
            className={getDialogModalV4PanelClassName(width, lgWidth, panel)}
          >
            {panel === "bare" ? children : <div className="lg:pb-0 lg:p-6">{children}</div>}
          </TransitionChild>
        </div>
      </div>
    </Transition>,
    document.body,
  );
};

export default DialogModalV4Plain;
