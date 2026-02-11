import { ConnectButtonCustom } from "@components/Connect";
import CurrencyToggle from "@components/Header/CurrencyToggle";
import PlayCreateToggle from "@components/Header/PlayCreateToggle";
import CustomLink from "@components/UI/Link";
import Logo from "@components/UI/Logo";
import { FC } from "react";

const MainHeaderDesktopLayout: FC = () => {
  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center px-12 mt-8">
      <CustomLink href="/">
        <Logo />
      </CustomLink>
      <PlayCreateToggle />
      <div className="flex items-center gap-3 justify-self-end">
        <ConnectButtonCustom />
        <CurrencyToggle />
      </div>
    </header>
  );
};

export default MainHeaderDesktopLayout;
