import { useModal } from "@getpara/react-sdk-lite";
import { DESKTOP_HEADER_MIN_WIDTH_PX } from "@helpers/isMobileViewport";
import { MediaQuery } from "@helpers/mediaQuery";
import { useWallet } from "@hooks/useWallet";
import { FC } from "react";
import MainHeaderDesktopLayout from "./DesktopLayout";
import MainHeaderMobileLayout from "./MobileLayout";

interface MainHeaderProps {
  showProfile?: boolean;
  isContestPage?: boolean;
}

const MainHeader: FC<MainHeaderProps> = ({ showProfile, isContestPage = false }) => {
  const { isConnected, userAddress } = useWallet();
  const { openModal } = useModal();

  return (
    <div>
      <MediaQuery maxWidth={DESKTOP_HEADER_MIN_WIDTH_PX - 1}>
        <MainHeaderMobileLayout
          isConnected={isConnected}
          address={userAddress ?? ""}
          openConnectModal={() => openModal()}
        />
      </MediaQuery>
      <MediaQuery minWidth={DESKTOP_HEADER_MIN_WIDTH_PX}>
        <MainHeaderDesktopLayout isContestPage={isContestPage} />
      </MediaQuery>
    </div>
  );
};

export default MainHeader;
