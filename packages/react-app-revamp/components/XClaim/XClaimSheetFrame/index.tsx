import Drawer from "@components/UI/Drawer";
import DialogModalV4 from "@components/UI/DialogModalV4";
import { useViewportLayout } from "@components/XClaim/board";
import XClaimSheetContent from "@components/XClaim/XClaimSheetContent";
import type { XClaimActions, XClaimSheetView } from "lib/xClaim/types";
import { FC, useState } from "react";

interface XClaimSheetFrameProps {
  isOpen: boolean;
  view: XClaimSheetView;
  actions: XClaimActions;
  onAddFunds: () => void;
}

const XClaimSheetFrame: FC<XClaimSheetFrameProps> = ({ isOpen, view, actions, onAddFunds }) => {
  const layout = useViewportLayout();
  const [lastOpenView, setLastOpenView] = useState(view);
  if (isOpen && lastOpenView !== view) setLastOpenView(view);

  const content = (
    <XClaimSheetContent view={isOpen ? view : lastOpenView} actions={actions} layout={layout} onAddFunds={onAddFunds} />
  );

  if (layout === "modal") {
    return (
      <DialogModalV4 isOpen={isOpen} onClose={actions.close} allowsExternalOverlays panel="bare">
        {content}
      </DialogModalV4>
    );
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={actions.close}
      handleSize="compact"
      className="bg-true-black w-full h-auto border-neutral-9! border-x-0! md:max-w-[550px] m-auto"
    >
      {content}
    </Drawer>
  );
};

export default XClaimSheetFrame;
