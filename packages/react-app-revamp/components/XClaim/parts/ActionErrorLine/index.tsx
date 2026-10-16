import { FAILURE_LINE } from "@components/XClaim/copy";
import type { XClaimFailure } from "lib/xClaim/types";
import { FC } from "react";

interface ActionErrorLineProps {
  error: XClaimFailure | null;
}

const ActionErrorLine: FC<ActionErrorLineProps> = ({ error }) => {
  if (!error) return null;

  return (
    <p role="alert" data-failure={error.reason} className="text-center text-[14px] leading-[1.45] text-negative-11">
      {FAILURE_LINE[error.reason]}
    </p>
  );
};

export default ActionErrorLine;
