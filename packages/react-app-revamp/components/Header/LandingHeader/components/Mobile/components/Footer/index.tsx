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
import { useLogout, useModal } from "@getpara/react-sdk-lite";
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
import { useCallback, useEffect, useState } from "react";
import { useWallet } from "@hooks/useWallet";

const LandingHeaderMobileFooter = () => {
  const { isConnected, userAddress } = useWallet();
  const { logoutAsync } = useLogout();
  const pathname = usePathname();
  const [isInPwaMode, setIsInPwaMode] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const isActive = (route: string) => (pathname === route ? "font-bold" : "");
  const isOneOfActive = (routes: string[]) => (routes.includes(pathname ?? "") ? "font-bold" : "");
  const { openModal } = useModal();
  const allowedLinks = ["Github", "Linktree", "Report a bug", "Terms", "Privacy Policy", "Docs", "Media Kit", "FAQ"];
  const filteredLinks = FOOTER_LINKS.filter(link => allowedLinks.includes(link.label));
  const [showWalletPortal, setShowWalletPortal] = useState(false);

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
    <footer className="bg-true-black">
      <div
        className={`fixed bottom-0 left-0 right-0 flex flex-col border-t-2 border-neutral-2 bg-true-black z-50 ${
          isClient && isInPwaMode ? "pb-8" : "pb-2"
        }`}
      >
        <div className="text-neutral-10 border-b text-[14px] border-neutral-2 py-2 overflow-hidden relative">
          <div className="flex items-center w-full overflow-x-auto no-scrollbar px-4 pb-1">
            <div className="flex gap-4 items-center min-w-max">
              {filteredLinks.map((link, key) => (
                <a
                  className="font-bold whitespace-nowrap py-1"
                  key={`footer-link-${key}`}
                  href={link.href}
                  rel="nofollow noreferrer"
                  target="_blank"
                  aria-label={`Visit ${link.label}`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-linear-to-l from-true-black to-transparent pointer-events-none"></div>
        </div>
        <div className="flex flex-row items-center justify-between pt-2 px-8">
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
            {isOneOfActive([ROUTE_VIEW_LIVE_CONTESTS, ROUTE_VIEW_CONTEST]) ? (
              <TrophyIconSolid width={24} />
            ) : (
              <TrophyIcon width={24} />
            )}
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
              <div className="flex flex-col items-center" onClick={() => openModal()}>
                <img width={24} height={24} src="/header/wallet.svg" alt="wallet" />
                <p className="text-[12px]">wallet</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {isClient && (
        <MobileProfileDrawer
          isOpen={showWalletPortal}
          onClose={closeWalletPortal}
          address={userAddress ?? ""}
          onDisconnect={handleDisconnect}
        />
      )}
    </footer>
  );
};

export default LandingHeaderMobileFooter;
