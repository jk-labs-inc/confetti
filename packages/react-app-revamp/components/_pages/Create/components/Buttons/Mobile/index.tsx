import { useMobileNavSlot } from "@hooks/useMobileNavSlot";
import React from "react";
import ReactDOM from "react-dom";

type MobileBottomButtonProps = React.PropsWithChildren<{}>;

const MobileBottomButton: React.FC<MobileBottomButtonProps> = ({ children }) => {
  const portalTarget = useMobileNavSlot();

  if (!portalTarget) return null;

  return ReactDOM.createPortal(<>{children}</>, portalTarget);
};

export default MobileBottomButton;
