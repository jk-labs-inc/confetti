import Drawer from "@components/UI/Drawer";
import DialogModalV4 from "@components/UI/DialogModalV4";
import { useViewportLayout, type XClaimLayout } from "@components/XClaim/board";
import { ReactNode, useState } from "react";

interface XClaimSheetFrameProps<T> {
  isOpen: boolean;
  value: T;
  onClose: () => void;
  children: (value: T, layout: XClaimLayout) => ReactNode;
}

const XClaimSheetFrame = <T,>({ isOpen, value, onClose, children }: XClaimSheetFrameProps<T>) => {
  const layout = useViewportLayout();
  const [lastOpenValue, setLastOpenValue] = useState(value);
  if (isOpen && lastOpenValue !== value) setLastOpenValue(value);

  const content = children(isOpen ? value : lastOpenValue, layout);

  if (layout === "modal") {
    return (
      <DialogModalV4 isOpen={isOpen} onClose={onClose} allowsExternalOverlays panel="bare">
        {content}
      </DialogModalV4>
    );
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      handleSize="compact"
      className="bg-true-black w-full h-auto border-neutral-9! border-x-0! md:max-w-[550px] m-auto"
    >
      {content}
    </Drawer>
  );
};

export default XClaimSheetFrame;
