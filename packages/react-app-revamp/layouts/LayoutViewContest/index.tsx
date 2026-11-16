"use client";
import HowItWorksTrigger from "@components/HowItWorksExplainer/Trigger";
import Loader from "@components/UI/Loader";
import ContestClock from "@components/_pages/Contest/components/ContestClock";
import { SELF_FUND_VERSION } from "constants/versions";
import ContestTabs, { Tab } from "@components/_pages/Contest/components/Tabs";
import PreVoteCard from "@components/_pages/Contest/PreVote/PreVoteCard";
import { populateBugReportLink } from "@helpers/githubIssue";
import { DESKTOP_HEADER_MIN_WIDTH_PX, MOBILE_MAX_WIDTH_PX } from "@helpers/isMobileViewport";
import { MediaQuery } from "@helpers/mediaQuery";
import { safeCompareVersions } from "@helpers/versions";
import {
  CONTEST_ULTRAWIDE_WIDTH_CLASS_NAME,
  ContestLayoutBand,
  useContestLayoutBand,
} from "@hooks/useContestLayoutBand";
import useContestEntryType from "@hooks/useContestEntryType";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import useTotalVotesCastOnContest from "@hooks/useTotalVotesCastOnContest";
import { useViewportBoundHeight } from "@hooks/useViewportBoundHeight";
import { useWallet } from "@hooks/useWallet";
import { useUrl } from "nextjs-current-url";
import { useMemo, useState } from "react";
import ContestHeader from "./components/ContestHeader";
import ContestTabsContent from "./components/ContestTabsContent";
import LayoutViewContestError from "./components/Error";
import ReadOnlyBanner from "./components/ReadOnlyBanner";
import { getContestImageUrl } from "./helpers/getContestImageUrl";
import { useHasNoEntries } from "./hooks/useEntriesReady";
import { useIsPreVoteSplit } from "./hooks/useIsPreVoteSplit";
import { useLayoutViewContest } from "./hooks/useLayoutViewContest";

const BAND_ROOT_CLASS_NAME = `flex flex-col grow min-h-0 mx-auto w-full px-6 pt-6 md:px-8 md:pt-8 lg:pt-10 lg:px-0 lg:w-[calc(100%-2rem)] lg:max-w-[1272px] wide:max-w-[1352px] ${CONTEST_ULTRAWIDE_WIDTH_CLASS_NAME}`;
const LEGACY_ROOT_CLASS_NAME =
  "flex flex-col w-full px-6 pt-6 md:px-12 md:pt-8 lg:pt-10 md:pb-20 lg:w-[760px] lg:px-0 mx-auto";
const PRE_VOTE_SPLIT_ROOT_CLASS_NAME =
  "flex flex-col w-full px-6 pt-6 md:px-12 md:pt-8 lg:pt-10 md:pb-20 lg:w-[calc(100%-4rem)] lg:max-w-[1060px] lg:px-0 mx-auto";

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
  const isCanceled = contestState === ContestStateEnum.Canceled;
  const isVotingOpen = contestStatus === ContestStatus.VotingOpen;
  const isVotingClosed = contestStatus === ContestStatus.VotingClosed;
  const { totalVotesCast, isLoading: isTotalVotesCastLoading } = useTotalVotesCastOnContest(
    contestConfig.address,
    contestConfig.chainId,
  );
  const contestHasVotes = !!totalVotesCast && Number(totalVotesCast) > 0;
  const showVoteRail = !isCanceled && isVotingOpen;
  const showMarketRail = !isCanceled && (isVotingOpen || (isVotingClosed && contestHasVotes));

  const isTerminal = useContestLayoutBand() === ContestLayoutBand.Terminal;
  const hasNoEntries = useHasNoEntries();
  const { ref: rootRef, height: boundHeight } = useViewportBoundHeight(
    showMarketRail && !hasNoEntries && tab === Tab.Contest && isTerminal,
  );

  const excludeTabs = useMemo(() => {
    const tabsToExclude: Tab[] = [];
    if (!rewardsModule) {
      tabsToExclude.push(Tab.Rewards);
    }
    return tabsToExclude;
  }, [rewardsModule]);

  const needsRewardsDeploy =
    !rewardsModule && (safeCompareVersions(contestConfig.version, SELF_FUND_VERSION) ?? -1) >= 0;
  const isPreVoteSplit = useIsPreVoteSplit() && !showMarketRail && !needsRewardsDeploy;
  const rootClassName = showMarketRail
    ? BAND_ROOT_CLASS_NAME
    : isPreVoteSplit
      ? PRE_VOTE_SPLIT_ROOT_CLASS_NAME
      : LEGACY_ROOT_CLASS_NAME;

  if (error && !isLoading) {
    return <LayoutViewContestError error={error} bugReportLink={bugReportLink} />;
  }

  if (isLoading || (isVotingClosed && isTotalVotesCastLoading)) {
    return <Loader>Loading contest info...</Loader>;
  }

  const header = (
    <ContestHeader
      contestImageUrl={contestImageUrl ?? ""}
      contestName={contestName}
      contestAddress={contestConfig.address}
      chainName={contestConfig.chainName}
      contestPrompt={contestPrompt}
      canEditTitle={canEditTitleAndDescription}
      contestAuthorEthereumAddress={contestAuthorEthereumAddress}
      contestVersion={contestConfig.version}
      isWideLayout={showMarketRail}
      showDescriptionToggle={showMarketRail}
      showHeadlineStats={!isPreVoteSplit}
    />
  );
  const tabs = (
    <div className="shrink-0 mt-2 md:mt-5">
      <ContestTabs
        tab={tab}
        excludeTabs={excludeTabs}
        onChange={tab => setTab(tab)}
        rightContent={
          <>
            <div className="hidden md:flex items-center">
              <MediaQuery minWidth={MOBILE_MAX_WIDTH_PX + 1} maxWidth={DESKTOP_HEADER_MIN_WIDTH_PX - 1}>
                <HowItWorksTrigger />
              </MediaQuery>
            </div>
            {showMarketRail && (
              <MediaQuery maxWidth={MOBILE_MAX_WIDTH_PX}>
                <ContestClock size="sm" />
              </MediaQuery>
            )}
          </>
        }
      />
    </div>
  );
  const content = (
    <ContestTabsContent
      tab={tab}
      showVoteRail={showVoteRail}
      showMarketRail={showMarketRail}
      isPreVoteSplit={isPreVoteSplit}
      needsRewardsDeploy={needsRewardsDeploy}
    />
  );

  return (
    <div
      ref={rootRef}
      className={rootClassName}
      style={boundHeight === undefined ? undefined : { height: boundHeight }}
    >
      <ReadOnlyBanner isReadOnly={isReadOnly} isLoading={isLoading} />
      <div className={isPreVoteSplit ? "flex items-start gap-11" : "contents"}>
        <div className={isPreVoteSplit ? "flex min-w-0 flex-1 flex-col" : "contents"}>
          {header}
          {tabs}
          {content}
        </div>
        {isPreVoteSplit && <PreVoteCard />}
      </div>
    </div>
  );
};

export default LayoutViewContest;
