import { DESKTOP_HEADER_MIN_WIDTH_PX } from "@helpers/isMobileViewport";
import { MediaQuery } from "@helpers/mediaQuery";
import { usePageActionStore } from "@hooks/useCreateFlowAction/store";
import { useDeployContestStore } from "@hooks/useDeployContest/store";
import { useWallet } from "@hooks/useWallet";
import { useClaimFirstSignIn } from "@hooks/useXClaim/useClaimFirstSignIn";
import { useEffect } from "react";
import { useShallow } from "zustand/shallow";
import MainHeaderMobileLayout from "../MainHeader/MobileLayout";
import CreateFlowHeaderDesktopLayout from "./DesktopLayout";

const CreateFlowHeader = () => {
  const { isConnected, userAddress } = useWallet();
  const { isLoading, isSuccess } = useDeployContestStore(
    useShallow(state => ({ isLoading: state.isLoading, isSuccess: state.isSuccess })),
  );
  const { pageAction, setPageAction } = usePageActionStore(
    useShallow(state => ({ pageAction: state.pageAction, setPageAction: state.setPageAction })),
  );
  const signIn = useClaimFirstSignIn();

  useEffect(() => {
    return () => {
      setPageAction("create");
    };
  }, [setPageAction]);

  return (
    <div>
      <MediaQuery maxWidth={DESKTOP_HEADER_MIN_WIDTH_PX - 1}>
        <MainHeaderMobileLayout isConnected={isConnected} address={userAddress ?? ""} openConnectModal={signIn} />
      </MediaQuery>
      <MediaQuery minWidth={DESKTOP_HEADER_MIN_WIDTH_PX}>
        <CreateFlowHeaderDesktopLayout
          address={userAddress ?? ""}
          isLoading={isLoading}
          isSuccess={isSuccess}
          pageAction={pageAction}
        />
      </MediaQuery>
    </div>
  );
};

export default CreateFlowHeader;
