"use client";
import Loader from "@components/UI/Loader";
import VotingSidebar from "@components/_pages/Contest/VotingSidebar";
import ContestTabs, { Tab } from "@components/_pages/Contest/components/Tabs";
import { populateBugReportLink } from "@helpers/githubIssue";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { useWallet } from "@hooks/useWallet";
import { useUrl } from "nextjs-current-url";
import { useMemo, useState } from "react";
import ContestHeader from "./components/ContestHeader";
import ContestTabsContent from "./components/ContestTabsContent";
import LayoutViewContestError from "./components/Error";
import ReadOnlyBanner from "./components/ReadOnlyBanner";
import { getContestImageUrl } from "./helpers/getContestImageUrl";
import { useLayoutViewContest } from "./hooks/useLayoutViewContest";

const LayoutViewContest = () => {
  const url = useUrl();
  const { userAddress } = useWallet();
  const [tab, setTab] = useState<Tab>(Tab.Contest);
  const {
    contestConfig,
    isLoading,
    error,
    contestAuthorEthereumAddress,
    rewardsModule,
    contestName,
    isReadOnly,
    contestPrompt,
    canEditTitleAndDescription,
  } = useLayoutViewContest();
  const bugReportLink = populateBugReportLink(url?.href ?? "", userAddress ?? "", error ?? "");
  const contestImageUrl = getContestImageUrl(contestPrompt);
  const contestStatus = useContestStatusStore(state => state.contestStatus);
  const contestState = useContestStateStore(state => state.contestState);
  const showSidebar =
    contestStatus === ContestStatus.VotingOpen && contestState !== ContestStateEnum.Canceled;

  const excludeTabs = useMemo(() => {
    const tabsToExclude: Tab[] = [];
    if (!rewardsModule) {
      tabsToExclude.push(Tab.Rewards);
    }
    return tabsToExclude;
  }, [rewardsModule]);

  if (error && !isLoading) {
    return <LayoutViewContestError error={error} bugReportLink={bugReportLink} />;
  }

  if (isLoading) {
    return <Loader>Loading contest info...</Loader>;
  }

  return (
    <div
      className={`w-full px-6 pt-6 md:px-12 md:pt-0 lg:w-[760px] lg:px-0 mx-auto ${showSidebar ? "xl:w-[1272px]" : ""}`}
    >
      <div className={`md:pt-5 md:pb-20 ${showSidebar ? "xl:flex xl:items-start xl:gap-8" : ""}`}>
        <div className={`flex flex-col md:col-span-9 ${showSidebar ? "xl:w-[760px] xl:shrink-0" : ""}`}>
          <ReadOnlyBanner isReadOnly={isReadOnly} isLoading={isLoading} />

          <ContestHeader
            contestImageUrl={contestImageUrl ?? ""}
            contestName={contestName}
            contestAddress={contestConfig.address}
            chainName={contestConfig.chainName}
            contestPrompt={contestPrompt}
            canEditTitle={canEditTitleAndDescription}
            contestAuthorEthereumAddress={contestAuthorEthereumAddress}
            contestVersion={contestConfig.version}
          />
          <div>
            <div className="mt-4 gap-3 flex flex-col">
              <ContestTabs tab={tab} excludeTabs={excludeTabs} onChange={tab => setTab(tab)} />
            </div>

            <ContestTabsContent tab={tab} rewardsModule={rewardsModule} version={contestConfig.version} />
          </div>
        </div>
        {showSidebar && (
          <aside className="hidden xl:block xl:w-[480px] xl:shrink-0 xl:mt-10 sticky top-4 self-start">
            <VotingSidebar />
          </aside>
        )}
      </div>
    </div>
  );
};

export default LayoutViewContest;
