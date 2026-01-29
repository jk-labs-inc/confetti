import { useModal } from "@getpara/react-sdk-lite";
import { MediaQuery } from "@helpers/mediaQuery";
import { useWallet } from "@hooks/useWallet";
import { FC } from "react";
import MainHeaderDesktopLayout from "./DesktopLayout";
import MainHeaderMobileLayout from "./MobileLayout";

interface MainHeaderProps {
  showProfile?: boolean;
}

const MainHeader: FC<MainHeaderProps> = ({ showProfile }) => {
  const { isConnected, userAddress } = useWallet();
  const { openModal } = useModal();

  return (
    <div>
      <MediaQuery maxWidth={1024}>
        <MainHeaderMobileLayout
          isConnected={isConnected}
          address={userAddress ?? ""}
          openConnectModal={() => openModal()}
        />
      </MediaQuery>
      <MediaQuery minWidth={1025}>
        <MainHeaderDesktopLayout />
      </MediaQuery>
    </div>
  );
};

export default MainHeader;
