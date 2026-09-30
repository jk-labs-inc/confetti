import { MOBILE_MAX_WIDTH_PX } from "@helpers/isMobileViewport";
import { FC } from "react";
import { useMediaQuery } from "react-responsive";
import DesktopHeader from "./components/DesktopHeader";
import MobileHeader from "./components/MobileHeader";

interface ContestHeaderProps {
  contestImageUrl: string;
  contestName: string;
  contestAddress: string;
  chainName: string;
  contestPrompt: string;
  canEditTitle: boolean;
  contestAuthorEthereumAddress: string;
  contestVersion: string;
  isWideLayout: boolean;
  showDescriptionToggle: boolean;
}

const ContestHeader: FC<ContestHeaderProps> = props => {
  const isMobile = useMediaQuery({ maxWidth: MOBILE_MAX_WIDTH_PX });

  if (isMobile) {
    return (
      <MobileHeader
        contestName={props.contestName}
        contestAddress={props.contestAddress}
        chainName={props.chainName}
        canEditTitle={props.canEditTitle}
        contestAuthorEthereumAddress={props.contestAuthorEthereumAddress}
        contestVersion={props.contestVersion}
        contestPrompt={props.contestPrompt}
        showDescriptionToggle={props.showDescriptionToggle}
      />
    );
  }

  return <DesktopHeader {...props} />;
};

export default ContestHeader;
