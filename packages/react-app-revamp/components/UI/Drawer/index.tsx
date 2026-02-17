import { FC, useCallback } from "react";
import { Drawer as VaulDrawer } from "vaul";

interface DrawerProps {
  isOpen: boolean;
  children: React.ReactNode;
  isHandleHidden?: boolean;
  className?: string;
  onClose?: () => void;
}

const isInteractionInsideParaModal = (e: React.SyntheticEvent | Event | { detail?: { originalEvent?: Event } }) => {
  const target =
    (e as { detail?: { originalEvent?: Event } }).detail?.originalEvent?.target ?? (e as Event).target;

  if (!target) return false;

  const el = target as HTMLElement;
  return !!el.closest?.("cpsl-auth-modal");
};

const Drawer: FC<DrawerProps> = ({ isOpen, children, className, onClose, isHandleHidden = false }) => {
  const handleOpenChange = (open: boolean) => {
    if (!open && onClose) {
      onClose();
    }
  };

  const handleInteractOutside = useCallback((e: Event) => {
    if (isInteractionInsideParaModal(e)) {
      e.preventDefault();
    }
  }, []);

  return (
    <VaulDrawer.Root open={isOpen} onOpenChange={handleOpenChange}>
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className="fixed inset-0 bg-neutral-8/40 z-40" />
        <VaulDrawer.Content
          title="Drawer"
          className={`z-50 rounded-t-[40px] border-t border-l border-r border-neutral-17 h-fit fixed bottom-0 left-0 right-0 outline-none ${className}`}
          onPointerDownOutside={handleInteractOutside}
          onInteractOutside={handleInteractOutside}
        >
          <VaulDrawer.Title hidden>Drawer</VaulDrawer.Title>
          <VaulDrawer.Handle
            hidden={isHandleHidden}
            className="!mx-auto !w-12 !h-1.5 !flex-shrink-0 !rounded-full !bg-neutral-9 !my-4"
          />
          {children}
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
};

export default Drawer;
