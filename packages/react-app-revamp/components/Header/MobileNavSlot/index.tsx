import XClaimNavTip from "@components/XClaim/entry/XClaimNavTip";
import { MOBILE_NAV_SLOT_ID } from "@hooks/useMobileNavSlot";
import type { XClaimOffer } from "lib/xClaim/types";
import { FC } from "react";

interface MobileNavSlotProps {
  claimOffer: XClaimOffer;
}

const MobileNavSlot: FC<MobileNavSlotProps> = ({ claimOffer }) => (
  <>
    <div id={MOBILE_NAV_SLOT_ID} className="peer" />
    <XClaimNavTip claimOffer={claimOffer} />
  </>
);

export default MobileNavSlot;
