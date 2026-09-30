import ContestName from "@components/_pages/Contest/components/ContestName";
import ContestRewardsInfo from "@components/_pages/Contest/components/RewardsInfo";
import { CONTEST_TERMINAL_MIN_WIDTH_PX } from "@hooks/useContestLayoutBand";
import { FC } from "react";
import { useMediaQuery } from "react-responsive";
import { useDescriptionDisclosure } from "../../hooks/useDescriptionDisclosure";
import ContestTiming from "./components/ContestTiming";

interface DesktopHeaderProps {
  contestImageUrl: string;
  contestName: string;
  contestPrompt: string;
  canEditTitle: boolean;
  contestAuthorEthereumAddress: string;
  contestVersion: string;
  isWideLayout: boolean;
  showDescriptionToggle?: boolean;
}

const HEADLINE_ROW_CLASS_NAME = {
  inline: "flex items-baseline gap-3",
  stacked: "flex flex-col gap-2",
  wrapping: "flex flex-wrap items-baseline gap-x-6 gap-y-2",
};
const HEADLINE_STATS_CLASS_NAME = "flex items-baseline gap-5 wide:gap-6 shrink-0 whitespace-nowrap";

const DesktopHeader: FC<DesktopHeaderProps> = ({
  contestImageUrl,
  contestName,
  contestPrompt,
  canEditTitle,
  contestAuthorEthereumAddress,
  contestVersion,
  isWideLayout,
  showDescriptionToggle = false,
}) => {
  const description = useDescriptionDisclosure(showDescriptionToggle, contestPrompt);
  const isTooNarrowForOneLine = useMediaQuery({ maxWidth: CONTEST_TERMINAL_MIN_WIDTH_PX - 1 });
  const rowLayout = !isWideLayout ? "wrapping" : isTooNarrowForOneLine ? "stacked" : "inline";

  return (
    <div className="animate-fade-in shrink-0 flex flex-col">
      <div className={HEADLINE_ROW_CLASS_NAME[rowLayout]}>
        <ContestName
          contestName={contestName}
          canEditTitle={canEditTitle}
          contestAuthorEthereumAddress={contestAuthorEthereumAddress}
          contestPrompt={contestPrompt}
          contestImageUrl={contestImageUrl}
          titleLeading={description.toggle}
          actionsPlacement={isWideLayout ? "inline" : "hanging"}
        />
        <div className={rowLayout === "inline" ? `ml-auto ${HEADLINE_STATS_CLASS_NAME}` : HEADLINE_STATS_CLASS_NAME}>
          <ContestRewardsInfo version={contestVersion} variant="headline" />
          <ContestTiming variant="headline" />
        </div>
      </div>
      {description.panel}
    </div>
  );
};

export default DesktopHeader;
