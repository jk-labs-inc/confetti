import XClaimAddFunds from "@components/XClaim/XClaimAddFunds";
import XClaimSheetContent from "@components/XClaim/XClaimSheetContent";
import XClaimSheetFrame from "@components/XClaim/XClaimSheetFrame";
import type { XClaimHookReturn } from "@hooks/useXClaim";
import { FC, useState } from "react";

type XClaimSheetProps = Pick<XClaimHookReturn, "sheet" | "actions">;

const XClaimSheet: FC<XClaimSheetProps> = ({ sheet, actions }) => {
  const [addFundsRequest, setAddFundsRequest] = useState(0);

  const addFunds = () => {
    actions.close();
    setAddFundsRequest(count => count + 1);
  };

  return (
    <>
      <XClaimSheetFrame isOpen={sheet.isOpen} value={sheet.view} onClose={actions.close}>
        {(view, layout) => (
          <XClaimSheetContent view={view} actions={actions} layout={layout} onAddFunds={addFunds} justVote={null} />
        )}
      </XClaimSheetFrame>
      {addFundsRequest > 0 && <XClaimAddFunds request={addFundsRequest} />}
    </>
  );
};

export default XClaimSheet;
