import ContestName from "@components/_pages/Contest/components/ContestName";
import { FC } from "react";

interface DesktopHeaderProps {
  contestImageUrl: string;
  contestName: string;
  contestPrompt: string;
  canEditTitle: boolean;
  contestAuthorEthereumAddress: string;
  contestVersion: string;
}

const DesktopHeader: FC<DesktopHeaderProps> = ({
  contestImageUrl,
  contestName,
  contestPrompt,
  canEditTitle,
  contestAuthorEthereumAddress,
}) => {
  return (
    <div className="animate-fade-in relative z-10">
      <div className="flex mt-10">
        <ContestName
          contestName={contestName}
          canEditTitle={canEditTitle}
          contestAuthorEthereumAddress={contestAuthorEthereumAddress}
          contestPrompt={contestPrompt}
          contestImageUrl={contestImageUrl}
        />
      </div>
    </div>
  );
};

export default DesktopHeader;
