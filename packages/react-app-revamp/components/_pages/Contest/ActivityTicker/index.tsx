import EndedDot from "@components/UI/LivePingDot/EndedDot";
import LivePingDot from "@components/UI/LivePingDot";
import Ticker from "@components/UI/Ticker";
import { useContestActivityFeed } from "@hooks/useContestActivityFeed";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { useNativePriceFormatter } from "@hooks/useNativePriceFormatter";
import { useReducedMotion } from "motion/react";
import { FC, useMemo, useState } from "react";
import FullBoardButton from "../MarketRail/components/FullBoardButton";
import ActivityModal from "./components/ActivityModal";
import TickerEvent from "./components/TickerEvent";
import { TICKER_EDGE_FADE_STYLE, TICKER_GAP_PX, TICKER_MAX_EVENTS, TICKER_VELOCITY_PX_PER_S } from "./constants";
import { useContentOverflows } from "./useContentOverflows";

const ActivityTicker: FC = () => {
  const isVotingOpen = useContestStatusStore(state => state.contestStatus) === ContestStatus.VotingOpen;
  const { votes, entryTitlesById, isLoading } = useContestActivityFeed({ latestCount: TICKER_MAX_EVENTS });
  const formatPrice = useNativePriceFormatter();
  const prefersReducedMotion = useReducedMotion();
  const { containerRef, contentRef, overflows } = useContentOverflows();
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const items = useMemo(
    () =>
      [...votes]
        .sort((a, b) => b.createdAt - a.createdAt)
        .map(vote => (
          <TickerEvent
            key={vote.uuid}
            vote={vote}
            entryTitle={entryTitlesById.get(vote.proposalId)}
            formatPrice={formatPrice}
          />
        )),
    [votes, entryTitlesById, formatPrice],
  );

  if (items.length === 0 && !isLoading) return null;

  return (
    <>
      <div className="flex h-7 shrink-0 items-center gap-2.5 overflow-hidden px-1">
        {isVotingOpen ? <LivePingDot /> : <EndedDot />}
        {items.length > 0 ? (
          <div
            ref={containerRef}
            className="relative min-w-0 flex-1 overflow-hidden"
            style={overflows ? TICKER_EDGE_FADE_STYLE : undefined}
          >
            <div
              ref={contentRef}
              aria-hidden={overflows}
              className={`flex w-max items-center ${overflows ? "invisible absolute inset-y-0 left-0" : ""}`}
              style={{ gap: TICKER_GAP_PX }}
            >
              {items}
            </div>
            {overflows && (
              <Ticker
                items={items}
                velocity={prefersReducedMotion ? 0 : TICKER_VELOCITY_PX_PER_S}
                gap={TICKER_GAP_PX}
              />
            )}
          </div>
        ) : (
          <span className="h-3 w-48 animate-pulse rounded-full bg-neutral-2" />
        )}
        {items.length > 0 && (
          <FullBoardButton variant="label" label="see all" onClick={() => setIsActivityModalOpen(true)} />
        )}
      </div>
      <ActivityModal isOpen={isActivityModalOpen} onClose={() => setIsActivityModalOpen(false)} />
    </>
  );
};

export default ActivityTicker;
