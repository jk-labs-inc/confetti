import ContestName from "@components/_pages/Contest/components/ContestName";
import ContestNotifyButton from "@components/_pages/Contest/components/ContestNotifyButton";
import ContestShareButton from "@components/_pages/Contest/components/ContestShareButton";
import { useContestStore } from "@hooks/useContest/store";
import { FC } from "react";
import { useShallow } from "zustand/shallow";
import { useDescriptionDisclosure } from "../../hooks/useDescriptionDisclosure";
import HeadlinePill from "./components/HeadlinePill";

interface DesktopHeaderProps {
  contestImageUrl: string;
  contestName: string;
  contestAddress: string;
  chainName: string;
  contestPrompt: string;
  canEditTitle: boolean;
  contestAuthorEthereumAddress: string;
  isWideLayout: boolean;
  showDescriptionToggle?: boolean;
}

const HEADLINE_ROW_CLASS_NAME = {
  inline: "flex items-baseline gap-3",
  wrapping: "flex flex-wrap items-baseline gap-x-6 gap-y-2",
};

const DesktopHeader: FC<DesktopHeaderProps> = ({
  contestImageUrl,
  contestName,
  contestAddress,
  chainName,
  contestPrompt,
  canEditTitle,
  contestAuthorEthereumAddress,
  isWideLayout,
  showDescriptionToggle = false,
}) => {
  const { votesOpen, votesClose } = useContestStore(
    useShallow(state => ({ votesOpen: state.votesOpen, votesClose: state.votesClose })),
  );
  const description = useDescriptionDisclosure(showDescriptionToggle, contestPrompt);
  const rowLayout = isWideLayout ? "inline" : "wrapping";

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
          titleTrailing={
            <>
              <ContestShareButton
                contestName={contestName}
                contestAddress={contestAddress}
                chainName={chainName}
                size="sm"
              />
              <ContestNotifyButton
                contestName={contestName}
                contestAddress={contestAddress}
                chainName={chainName}
                votesOpen={votesOpen}
                votesClose={votesClose}
                size="sm"
              />
            </>
          }
          actionsPlacement={isWideLayout ? "inline" : "hanging"}
        />
        <HeadlinePill className={rowLayout === "inline" ? "ml-auto self-center" : "self-center"} />
      </div>
      {description.panel}
    </div>
  );
};

export default DesktopHeader;
