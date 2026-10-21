import AddFundsModal from "@components/AddFunds/components/Modal";
import { useAddFunds } from "@hooks/useAddFunds";
import { POLYGON_CURRENCY, POLYGON_NETWORK } from "lib/xClaim/constants";
import { FC, useEffect, useRef, useState } from "react";

interface XClaimAddFundsProps {
  request: number;
}

const XClaimAddFunds: FC<XClaimAddFundsProps> = ({ request }) => {
  const { openAddFunds } = useAddFunds({ chain: POLYGON_NETWORK });
  const [isLegacyOpen, setIsLegacyOpen] = useState(false);
  const handledRequest = useRef(0);

  useEffect(() => {
    if (handledRequest.current === request) return;
    handledRequest.current = request;
    openAddFunds().then(opened => {
      if (!opened) setIsLegacyOpen(true);
    });
  }, [request, openAddFunds]);

  return (
    <AddFundsModal
      chain={POLYGON_NETWORK}
      asset={POLYGON_CURRENCY}
      isOpen={isLegacyOpen}
      onClose={() => setIsLegacyOpen(false)}
    />
  );
};

export default XClaimAddFunds;
