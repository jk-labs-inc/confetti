import { ConnectButtonCustom } from "@components/Connect";
import CurrencyToggle from "@components/Header/CurrencyToggle";
import PlayCreateToggle from "@components/Header/PlayCreateToggle";
import CustomLink from "@components/UI/Link";
import Logo from "@components/UI/Logo";
import { PageAction } from "@hooks/useCreateFlowAction/store";
import { FC } from "react";

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
  return (
    <header className="flex flex-row items-center justify-between px-12 mt-8">
      <CustomLink href="/">
        <Logo />
      </CustomLink>

      {!isLoading && !isSuccess && <PlayCreateToggle />}

      {!isLoading && !isSuccess && (
        <div className="flex items-center gap-3">
          <ConnectButtonCustom />
          <CurrencyToggle />
        </div>
      )}
    </header>
  );
};

export default CreateFlowHeaderDesktopLayout;
