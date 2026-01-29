import { ConnectButtonCustom } from "@components/Connect";
import CustomLink from "@components/UI/Link";
import Logo from "@components/UI/Logo";
import { ROUTE_CREATE_CONTEST, ROUTE_VIEW_LIVE_CONTESTS } from "@config/routes";
import { FC } from "react";

const MainHeaderDesktopLayout: FC = () => {
  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center px-12 mt-8">
      <CustomLink href="/">
        <Logo />
      </CustomLink>
      <div className="bg-true-black flex items-center gap-5 text-[24px] font-bold border-2 rounded-[20px] py-[2px] px-[30px] border-neutral-10 shadow-create-header">
        <CustomLink href={ROUTE_VIEW_LIVE_CONTESTS} className="text-neutral-11">
          play
        </CustomLink>
        <CustomLink href={ROUTE_CREATE_CONTEST} className="text-neutral-10">
          create
        </CustomLink>
      </div>
      <div className="justify-self-end">
        <ConnectButtonCustom />
      </div>
    </header>
  );
};

export default MainHeaderDesktopLayout;
