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
}

const ContestHeader: FC<ContestHeaderProps> = props => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  if (isMobile) {
    return (
      <MobileHeader
        contestName={props.contestName}
        contestAddress={props.contestAddress}
        chainName={props.chainName}
        canEditTitle={props.canEditTitle}
        contestAuthorEthereumAddress={props.contestAuthorEthereumAddress}
        contestVersion={props.contestVersion}
      />
    );
  }

  return <DesktopHeader {...props} />;
};

export default ContestHeader;
