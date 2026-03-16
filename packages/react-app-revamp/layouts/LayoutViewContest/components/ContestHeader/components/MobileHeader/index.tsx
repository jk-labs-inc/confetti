import BurgerMenu from "@components/UI/BurgerMenu";
import CurrencyToggle from "@components/Header/CurrencyToggle";
import UserProfileDisplay from "@components/UI/UserProfileDisplay";
import ContestShareButton from "@components/_pages/Contest/components/ContestShareButton";
import ContestRewardsInfo from "@components/_pages/Contest/components/RewardsInfo";
import ContestTiming from "../DesktopHeader/components/ContestTiming";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { FOOTER_LINKS } from "@config/links";
import { FC, useMemo } from "react";

const BURGER_MENU_LINKS = ["Github", "Linktree", "Docs", "Report a bug", "Terms", "Privacy Policy", "Media Kit", "FAQ"];

interface MobileHeaderProps {
  contestName: string;
  contestAddress: string;
  chainName: string;
  canEditTitle: boolean;
  contestAuthorEthereumAddress: string;
  contestVersion: string;
}

const MobileHeader: FC<MobileHeaderProps> = ({ contestName, contestAddress, chainName, contestAuthorEthereumAddress, contestVersion }) => {
  const { contestState } = useContestStateStore(state => state);
  const isContestCanceled = contestState === ContestStateEnum.Canceled;
  const filteredLinks = useMemo(() => FOOTER_LINKS.filter(link => BURGER_MENU_LINKS.includes(link.label)), []);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <UserProfileDisplay
              ethereumAddress={contestAuthorEthereumAddress}
              shortenOnFallback
              size="extraSmall"
              textColor="text-positive-11"
              showBy={false}
              hideCopy
            />
            <div className="flex items-center gap-4">
              <ContestShareButton
                contestName={contestName}
                contestAddress={contestAddress}
                chainName={chainName}
                size="sm"
              />
              <BurgerMenu iconClassName="w-6 h-4">
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
          </div>
          <p
            className={`text-neutral-11 font-sabo-filled ${contestName.length > 25 ? "text-[18px]" : "text-[20px]"} ${isContestCanceled ? "line-through" : ""}`}
          >
            {contestName}
          </p>
        </div>

        <div className="flex items-center gap-4 justify-between">
          <ContestRewardsInfo version={contestVersion} />
          <ContestTiming />
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
