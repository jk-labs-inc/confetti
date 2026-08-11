import { FC, useCallback, useEffect } from "react";
import { Drawer as VaulDrawer } from "vaul";

const VAUL_EXIT_ANIMATION_MS = 500;
const BODY_LOCK_CLEANUP_DELAY_MS = VAUL_EXIT_ANIMATION_MS + 200;

// vaul/radix own these body locks while a drawer is open, but can leak them on
// close (mobile-only freeze); once no drawer is open, none of them may remain.
const clearLeftoverBodyLock = () => {
  if (document.querySelector('[data-vaul-drawer][data-state="open"]')) return;

  const { style } = document.body;
  style.removeProperty("pointer-events");

  if (style.position === "fixed") {
    const scrollY = -parseInt(style.top, 10) || 0;
    const scrollX = -parseInt(style.left, 10) || 0;
    for (const property of ["position", "top", "left", "right", "height"]) {
      style.removeProperty(property);
    }
    window.scrollTo(scrollX, scrollY);
  }

  document.body.removeAttribute("data-scroll-locked");
};

interface DrawerProps {
  isOpen: boolean;
  children: React.ReactNode;
  isHandleHidden?: boolean;
  className?: string;
  onClose?: () => void;
}

const shouldPreventDismiss = (e: React.SyntheticEvent | Event | { detail?: { originalEvent?: Event } }) => {
  const target = (e as { detail?: { originalEvent?: Event } }).detail?.originalEvent?.target ?? (e as Event).target;

  if (!target) return false;

  const el = target as HTMLElement;
  return !!el.closest?.("cpsl-auth-modal") || !!el.closest?.(".Toastify");
};

const Drawer: FC<DrawerProps> = ({ isOpen, children, className, onClose, isHandleHidden = false }) => {
  const handleOpenChange = (open: boolean) => {
    if (!open && onClose) {
      onClose();
    }
  };

  const handleInteractOutside = useCallback((e: Event) => {
    if (shouldPreventDismiss(e)) {
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    if (isOpen) return;
    const cleanupTimeout = setTimeout(clearLeftoverBodyLock, BODY_LOCK_CLEANUP_DELAY_MS);
    return () => clearTimeout(cleanupTimeout);
  }, [isOpen]);

  useEffect(() => {
    return () => {
      setTimeout(clearLeftoverBodyLock, BODY_LOCK_CLEANUP_DELAY_MS);
    };
  }, []);

  return (
    <VaulDrawer.Root open={isOpen} onOpenChange={handleOpenChange} repositionInputs={false} handleOnly>
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className="fixed inset-0 bg-neutral-8/40 z-40" />
        <VaulDrawer.Content
          className={`z-50 rounded-t-[40px] border-t border-l border-r border-neutral-17 flex flex-col fixed bottom-0 left-0 right-0 outline-none ${className}`}
          onPointerDownOutside={handleInteractOutside}
          onInteractOutside={handleInteractOutside}
          style={{ maxHeight: "calc(100dvh - 48px)" }}
        >
          <VaulDrawer.Title className="sr-only">Drawer</VaulDrawer.Title>
          <VaulDrawer.Handle
            hidden={isHandleHidden}
            className="mx-auto! w-12! h-1.5! shrink-0! rounded-full! bg-neutral-9! my-4!"
          />
          <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">{children}</div>
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
};

export default Drawer;
