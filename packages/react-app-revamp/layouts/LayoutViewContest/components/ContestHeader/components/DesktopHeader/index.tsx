import ContestImage from "@components/_pages/Contest/components/ContestImage";
import EditContestImage from "@components/_pages/Contest/components/ContestImage/components/EditContestImage";
import ContestName from "@components/_pages/Contest/components/ContestName";
import { FC } from "react";

interface DesktopHeaderProps {
  contestImageUrl: string;
  contestName: string;
  contestAddress: string;
  chainName: string;
  contestPrompt: string;
  canEditTitle: boolean;
  contestAuthorEthereumAddress: string;
  contestVersion: string;
}

const DesktopHeader: FC<DesktopHeaderProps> = ({
  contestImageUrl,
  contestName,
  contestAddress,
  chainName,
  contestPrompt,
  canEditTitle,
  contestAuthorEthereumAddress,
}) => {
  return (
    <div className="animate-fade-in relative z-10">
      <div className="flex flex-col mt-10 gap-6">
        {contestImageUrl && (
          <div className="relative">
            <div className="absolute left-0 -translate-x-full -ml-4 bottom-0">
              <EditContestImage contestPrompt={contestPrompt} canEditTitle={canEditTitle} />
            </div>
            <ContestImage imageUrl={contestImageUrl} />
          </div>
        )}

        <ContestName
          contestName={contestName}
          contestAddress={contestAddress}
          chainName={chainName}
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
