import UserProfileDisplay from "@components/UI/UserProfileDisplay";
import ContestName from "@components/_pages/Contest/components/ContestName";
import ContestRewardsInfo from "@components/_pages/Contest/components/RewardsInfo";
import { FC } from "react";
import RefreshButton from "../../../RefreshButton";

interface MobileHeaderProps {
  contestName: string;
  contestAddress: string;
  chainName: string;
  canEditTitle: boolean;
  contestAuthorEthereumAddress: string;
  contestVersion: string;
}

const MobileHeader: FC<MobileHeaderProps> = ({
  contestName,
  contestAddress,
  chainName,
  canEditTitle,
  contestAuthorEthereumAddress,
  contestVersion,
}) => {
  return (
    <div className="animate-fade-in pt-3">
      <div className="flex flex-col mt-6 gap-4">
        <ContestName
          contestName={contestName}
          contestAddress={contestAddress}
          chainName={chainName}
          canEditTitle={canEditTitle}
        />

        <div className="flex flex-row gap-3 items-center">
          <div className="flex flex-col gap-4">
            <UserProfileDisplay
              ethereumAddress={contestAuthorEthereumAddress}
              shortenOnFallback
              size="extraSmall"
            />

            <ContestRewardsInfo version={contestVersion} />
          </div>

          <RefreshButton />
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
