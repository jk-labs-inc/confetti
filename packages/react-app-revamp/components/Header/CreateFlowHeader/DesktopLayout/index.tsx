import { ConnectButtonCustom } from "@components/Connect";
import CustomLink from "@components/UI/Link";
import Logo from "@components/UI/Logo";
import { ROUTE_CREATE_CONTEST, ROUTE_VIEW_LIVE_CONTESTS } from "@config/routes";
import { PageAction } from "@hooks/useCreateFlowAction/store";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";

interface CreateFlowHeaderDesktopLayoutProps {
  address: string;
  isLoading: boolean;
  isSuccess: boolean;
  pageAction: PageAction;
}

const CreateFlowHeaderDesktopLayout: FC<CreateFlowHeaderDesktopLayoutProps> = ({
  address,
  isLoading,
  isSuccess,
  pageAction,
}) => {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleNavigation = (action: "play" | "create") => {
    if (action === "play") {
      router.push(ROUTE_VIEW_LIVE_CONTESTS);
    } else {
      router.push(ROUTE_CREATE_CONTEST);
    }
  };

  return (
    <header className="flex flex-row items-center justify-between pl-[120px] pr-[60px] mt-8">
      <CustomLink href="/">
        <Logo />
      </CustomLink>

      {!isLoading && !isSuccess && (
        <div className="flex items-center gap-5 text-[24px] font-bold border-2 rounded-[20px] py-[2px] px-[30px] border-neutral-10 shadow-create-header">
          <p
            className={`cursor-pointer ${pageAction === "play" ? "text-neutral-11" : "text-neutral-10"}`}
            onClick={() => handleNavigation("play")}
          >
            play
          </p>
          <p
            className={`cursor-pointer ${pageAction === "create" ? "text-neutral-11" : "text-neutral-10"}`}
            onClick={() => handleNavigation("create")}
          >
            create
          </p>
        </div>
      )}

      {!isLoading && !isSuccess && <ConnectButtonCustom />}
    </header>
  );
};

export default CreateFlowHeaderDesktopLayout;
