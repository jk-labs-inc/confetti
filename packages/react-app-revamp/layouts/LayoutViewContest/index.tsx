"use client";
import Loader from "@components/UI/Loader";
import VotingSidebar from "@components/_pages/Contest/VotingSidebar";
import ContestNotifyButton from "@components/_pages/Contest/components/ContestNotifyButton";
import ContestShareButton from "@components/_pages/Contest/components/ContestShareButton";
import ContestStickyTrigger from "@components/_pages/Contest/components/ContestStickyTrigger";
import ContestTabs, { Tab } from "@components/_pages/Contest/components/Tabs";
import { populateBugReportLink } from "@helpers/githubIssue";
import { useContestStore } from "@hooks/useContest/store";
import useContestEntryType from "@hooks/useContestEntryType";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { useContestStickyScroll } from "@hooks/useContestStickyScroll";
import { useContestStickyStore } from "@hooks/useContestStickyStore";
import useTotalVotesCastOnContest from "@hooks/useTotalVotesCastOnContest";
import { useWallet } from "@hooks/useWallet";
import { useUrl } from "nextjs-current-url";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
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

  useContestEntryType({
    address: contestConfig.address,
    chainId: contestConfig.chainId,
    abi: contestConfig.abi,
    version: contestConfig.version,
  });
  const bugReportLink = populateBugReportLink(url?.href ?? "", userAddress ?? "", error ?? "");
  const contestImageUrl = getContestImageUrl(contestPrompt);
  const contestStatus = useContestStatusStore(state => state.contestStatus);
  const contestState = useContestStateStore(state => state.contestState);
  const { votesOpen, votesClose } = useContestStore(
    useShallow(state => ({ votesOpen: state.votesOpen, votesClose: state.votesClose })),
  );
  const isVotingOpen = contestStatus === ContestStatus.VotingOpen;
  const isVotingClosed = contestStatus === ContestStatus.VotingClosed;
  const { totalVotesCast } = useTotalVotesCastOnContest(contestConfig.address, contestConfig.chainId, {
    enabled: isVotingClosed,
  });
  const contestHasVotes = !!totalVotesCast && Number(totalVotesCast) > 0;
  const showSidebar =
    contestState !== ContestStateEnum.Canceled && (isVotingOpen || (isVotingClosed && contestHasVotes));

  const isXl = useMediaQuery({ minWidth: 1280 });
  const isDualPane = showSidebar && isXl;
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const [paneHeight, setPaneHeight] = useState<number | null>(null);

  useEffect(() => {
    const root = document.documentElement;

    if (!isDualPane) {
      root.classList.remove("contest-dualpane");
      setPaneHeight(null);
      return;
    }

    root.classList.add("contest-dualpane");

    const measure = () => {
      const el = leftPaneRef.current;
      if (!el) return;
      const footer = document.querySelector("footer");
      const footerHeight = footer ? footer.getBoundingClientRect().height : 0;
      const top = el.getBoundingClientRect().top;
      setPaneHeight(Math.max(0, window.innerHeight - top - footerHeight));
    };
    measure();

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(document.body);
    window.addEventListener("resize", measure);

    return () => {
      root.classList.remove("contest-dualpane");
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [isDualPane]);

  const resetStickyStore = useContestStickyStore(state => state.reset);
  useEffect(() => () => resetStickyStore(), [resetStickyStore]);
  useContestStickyScroll(leftPaneRef, isDualPane);

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
      <div
        className={`md:pt-5 md:pb-20 ${
          showSidebar ? "xl:flex xl:gap-8 xl:pt-0 xl:pb-0 xl:h-[calc(100dvh_-_7rem)]" : ""
        }`}
        style={isDualPane && paneHeight != null ? { height: paneHeight } : undefined}
      >
        <div
          ref={leftPaneRef}
          className={`flex flex-col md:col-span-9 ${
            showSidebar
              ? "xl:w-[760px] xl:shrink-0 xl:h-full xl:min-h-0 xl:overflow-y-auto xl:overflow-x-hidden xl:overscroll-contain xl:px-4 no-scrollbar"
              : ""
          }`}
        >
          <ReadOnlyBanner isReadOnly={isReadOnly} isLoading={isLoading} />

          <ContestStickyTrigger trigger="compact" />
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
            <div className="mt-2 gap-3 flex flex-col">
              <ContestTabs
                tab={tab}
                excludeTabs={excludeTabs}
                onChange={tab => setTab(tab)}
                rightContent={
                  <div className="hidden md:flex items-center gap-3">
                    <ContestShareButton
                      contestName={contestName}
                      contestAddress={contestConfig.address}
                      chainName={contestConfig.chainName}
                    />
                    <ContestNotifyButton
                      contestName={contestName}
                      contestAddress={contestConfig.address}
                      chainName={contestConfig.chainName}
                      votesOpen={votesOpen}
                      votesClose={votesClose}
                    />
                  </div>
                }
              />
            </div>

            <ContestTabsContent tab={tab} rewardsModule={rewardsModule} version={contestConfig.version} />
          </div>
        </div>
        {showSidebar && (
          <aside className="hidden xl:block xl:w-[480px] xl:shrink-0 xl:h-full xl:min-h-0 xl:overflow-y-auto xl:overflow-x-hidden xl:overscroll-contain no-scrollbar xl:pt-4">
            <VotingSidebar />
          </aside>
        )}
      </div>
    </div>
  );
};

export default LayoutViewContest;
