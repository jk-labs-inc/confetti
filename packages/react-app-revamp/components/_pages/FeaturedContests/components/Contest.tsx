import { ROUTE_VIEW_CONTEST_BASE_PATH } from "@config/routes";
import { useQueryClient } from "@tanstack/react-query";
import { ContestWithTotalRewards, ProcessedContest } from "lib/contests/types";
import { FC, useEffect, useState } from "react";
import CalendarButton from "./Contest/components/CalendarButton";
import CardFooter from "./Contest/components/CardFooter";
import CardHeader from "./Contest/components/CardHeader";
import EntriesList from "./Contest/components/EntriesList";
import { getCardState, getTimingUpdateInterval } from "./Contest/helpers";
import useContestCardEntries from "./Contest/hooks/useContestCardEntries";
import { CardEntry } from "./Contest/types";
import FeaturedContestVoteOnEntry from "./VoteOnEntry";

interface FeaturedContestCardProps {
  contestData: ProcessedContest;
  rewardsData?: ContestWithTotalRewards | null;
  isRewardsFetching: boolean;
}

const FeaturedContestCard: FC<FeaturedContestCardProps> = ({ contestData, rewardsData, isRewardsFetching }) => {
  const [cardState, setCardState] = useState(() => getCardState(contestData));
  const [voteEntry, setVoteEntry] = useState<CardEntry | null>(null);
  const [isVoteOpen, setIsVoteOpen] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const updateCardState = () => setCardState(getCardState(contestData));

    updateCardState();

    const interval = setInterval(updateCardState, getTimingUpdateInterval(contestData));
    return () => clearInterval(interval);
  }, [contestData]);

  const { entries, totalEntries, hasEntryImages, isLoading, isExpanded, loadAll, config } = useContestCardEntries(
    contestData,
    cardState,
  );

  const contestUrl = ROUTE_VIEW_CONTEST_BASE_PATH.replace("[chain]", contestData.network_name ?? "").replace(
    "[address]",
    contestData.address ?? "",
  );

  const handleVoteClick = (entry: CardEntry) => {
    setVoteEntry(entry);
    setIsVoteOpen(true);
  };

  const handleVoteSuccess = () => {
    if (!config) return;
    queryClient.invalidateQueries({
      queryKey: ["contestEntriesVotes", contestData.address.toLowerCase(), config.chainId],
    });
    queryClient.invalidateQueries({ queryKey: ["totalRewards"] });
  };

  const isEnded = cardState === "ended" || cardState === "canceled";

  return (
    <div className="relative flex flex-col gap-4 p-4 w-full md:w-80 rounded-2xl border border-neutral-7 bg-[#141414] hover:border-neutral-10 transition-colors duration-200 animate-appear text-stroke-black">
      <CardHeader
        prompt={contestData.prompt}
        title={contestData.title}
        contestUrl={contestUrl}
        isEnded={isEnded}
        action={
          cardState === "upcoming" ? (
            <CalendarButton
              contestName={contestData.title}
              contestAddress={contestData.address}
              chainName={contestData.network_name}
              votesOpen={new Date(contestData.vote_start_at)}
              votesClose={new Date(contestData.end_at)}
            />
          ) : null
        }
      />
      <EntriesList
        contestUrl={contestUrl}
        entries={entries}
        totalEntries={totalEntries}
        cardState={cardState}
        hasEntryImages={hasEntryImages}
        isLoading={isLoading}
        isExpanded={isExpanded}
        onLoadAll={loadAll}
        onVoteClick={handleVoteClick}
      />
      <CardFooter contest={contestData} rewardsData={rewardsData} isRewardsFetching={isRewardsFetching} />
      {voteEntry && config && (
        <FeaturedContestVoteOnEntry
          contest={contestData}
          config={config}
          entry={voteEntry}
          submissionsCount={totalEntries}
          isOpen={isVoteOpen}
          onClose={() => setIsVoteOpen(false)}
          onVoteSuccess={handleVoteSuccess}
        />
      )}
    </div>
  );
};

export default FeaturedContestCard;
