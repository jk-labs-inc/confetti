import XClaimNavTip from "@components/XClaim/entry/XClaimNavTip";
import { MOBILE_NAV_SLOT_ID } from "@hooks/useMobileNavSlot";
import { FC } from "react";

const MobileNavSlot: FC = () => (
  <>
    <div id={MOBILE_NAV_SLOT_ID} className="peer" />
    <XClaimNavTip />
  </>
);

export default MobileNavSlot;
