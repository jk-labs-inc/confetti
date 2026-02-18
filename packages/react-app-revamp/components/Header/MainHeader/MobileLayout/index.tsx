import CurrencyToggle from "@components/Header/CurrencyToggle";
import BurgerMenu from "@components/UI/BurgerMenu";
import { IconMagnifyingGlassSolid } from "@components/UI/Icons";
import CustomLink from "@components/UI/Link";
import { MobileProfileDrawer } from "@components/UI/MobileWalletPortal";
import { FOOTER_LINKS } from "@config/links";
import {
  ROUTE_CREATE_CONTEST,
  ROUTE_LANDING,
  ROUTE_VIEW_CONTEST,
  ROUTE_VIEW_CONTESTS,
  ROUTE_VIEW_LIVE_CONTESTS,
} from "@config/routes";
import { useLogout } from "@getpara/react-sdk-lite";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrophyIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  PencilSquareIcon as PencilSquareIconSolid,
  TrophyIcon as TrophyIconSolid,
  UserCircleIcon as UserCircleIconSolid,
} from "@heroicons/react/24/solid";
import { usePathname } from "next/navigation";
import { FC, useCallback, useEffect, useMemo, useState } from "react";

const BURGER_MENU_LINKS = ["Github", "Linktree", "Docs", "Report a bug", "Terms", "Privacy Policy", "Media Kit", "FAQ"];

interface MainHeaderMobileLayoutProps {
  isConnected: boolean;
  address: string;
  openConnectModal?: () => void;
}

const MainHeaderMobileLayout: FC<MainHeaderMobileLayoutProps> = ({ isConnected, address, openConnectModal }) => {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isInPwaMode, setIsInPwaMode] = useState(false);
  const [showWalletPortal, setShowWalletPortal] = useState(false);
  const isActive = (route: string) => (pathname === route ? "font-bold" : "");
  const isOneOfActive = (routes: string[]) => (routes.includes(pathname ?? "") ? "font-bold" : "");
  const { logoutAsync } = useLogout();
  const filteredLinks = useMemo(() => FOOTER_LINKS.filter(link => BURGER_MENU_LINKS.includes(link.label)), []);

  useEffect(() => {
    setIsClient(true);
    setIsInPwaMode(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  const handleWalletClick = () => {
    setShowWalletPortal(true);
  };

  const closeWalletPortal = useCallback(() => {
    setShowWalletPortal(false);
  }, []);

  const handleDisconnect = useCallback(async () => {
    try {
      await logoutAsync({ clearPregenWallets: false });
      closeWalletPortal();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  }, [closeWalletPortal]);

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <BurgerMenu>
          <div className="flex flex-col gap-6 px-6">
            <div className="flex items-center gap-2">
              <CurrencyToggle />
            </div>
            <div className="flex flex-col gap-2">
              {filteredLinks.map((link, key) => (
                <a
                  className="font-sabo-filled text-neutral-11 text-[24px]"
                  key={`footer-link-${key}`}
                  href={link.href}
                  rel="nofollow noreferrer"
                  target="_blank"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </BurgerMenu>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-true-black">
        {/* Portal target for create flow buttons */}
        <div id="mobile-create-nav-slot" />

        <div
          className={`flex flex-row items-center justify-between border-t-2 border-neutral-2 py-3 ${
            isClient && isInPwaMode ? "pb-8" : "pb-2"
          } px-8`}
        >
          <CustomLink href={ROUTE_LANDING} className={`flex flex-col ${isActive(ROUTE_LANDING)}`}>
            {pathname === ROUTE_LANDING ? <HomeIconSolid width={24} /> : <HomeIcon width={24} />}
            <p className="text-[12px]">home</p>
          </CustomLink>

          <CustomLink href={ROUTE_VIEW_CONTESTS} className={`flex flex-col ${isActive(ROUTE_VIEW_CONTESTS)}`}>
            {pathname === ROUTE_VIEW_CONTESTS ? (
              <IconMagnifyingGlassSolid width={24} />
            ) : (
              <MagnifyingGlassIcon width={24} />
            )}
            <p className="text-[12px]">search</p>
          </CustomLink>

          <CustomLink
            href={ROUTE_VIEW_LIVE_CONTESTS}
            className={`flex flex-col text-neutral-11 ${isOneOfActive([ROUTE_VIEW_LIVE_CONTESTS, ROUTE_VIEW_CONTEST])}`}
          >
            {pathname === ROUTE_VIEW_LIVE_CONTESTS ? <TrophyIconSolid width={24} /> : <TrophyIcon width={24} />}
            <p className="text-[12px] text-center">play</p>
          </CustomLink>

          <CustomLink
            href={ROUTE_CREATE_CONTEST}
            className={`flex flex-col items-center ${isActive(ROUTE_CREATE_CONTEST)}`}
          >
            {pathname === ROUTE_CREATE_CONTEST ? <PencilSquareIconSolid width={24} /> : <PencilSquareIcon width={24} />}
            <p className="text-[12px]">create</p>
          </CustomLink>

          <div className="transition-all duration-500">
            {isConnected ? (
              <div className="flex flex-col items-center" onClick={handleWalletClick}>
                {showWalletPortal ? (
                  <UserCircleIconSolid width={24} height={24} className="text-neutral-11" />
                ) : (
                  <UserCircleIcon width={24} height={24} className="text-neutral-11" />
                )}
                <p className="text-[12px]">profile</p>
              </div>
            ) : (
              <div className="flex flex-col items-center" onClick={openConnectModal}>
                <img width={24} height={24} src="/header/wallet.svg" alt="wallet" />
                <p className="text-[12px]">wallet</p>
              </div>
            )}
          </div>
        </div>
      </nav>

      {isClient && (
        <MobileProfileDrawer
          isOpen={showWalletPortal}
          onClose={closeWalletPortal}
          address={address}
          onDisconnect={handleDisconnect}
        />
      )}
    </>
  );
};

export default MainHeaderMobileLayout;
