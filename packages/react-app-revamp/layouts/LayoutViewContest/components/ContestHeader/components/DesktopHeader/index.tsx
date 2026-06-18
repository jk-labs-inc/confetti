import ContestName from "@components/_pages/Contest/components/ContestName";
import { FC } from "react";

interface DesktopHeaderProps {
  contestImageUrl: string;
  contestName: string;
  contestPrompt: string;
  canEditTitle: boolean;
  contestAuthorEthereumAddress: string;
}

const DesktopHeader: FC<DesktopHeaderProps> = ({
  contestImageUrl,
  contestName,
  contestPrompt,
  canEditTitle,
  contestAuthorEthereumAddress,
}) => {
  return (
    <div className="animate-fade-in sticky top-0 z-20 bg-true-black before:content-[''] before:absolute before:right-full before:top-0 before:bottom-0 before:w-24 before:bg-true-black">
      <div className="flex items-center pt-10 min-h-[96px]">
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
