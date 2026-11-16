import ListProposals from "@components/_pages/ListProposals";
import PriceCurveWrapper from "@components/PriceCurve/wrapper";
import { useEntriesReady } from "@layouts/LayoutViewContest/hooks/useEntriesReady";
import { FC, useId, useState } from "react";
import PreVoteDescription from "./components/PreVoteDescription";
import PreVoteEntriesHeader from "./components/PreVoteEntriesHeader";
import PreVoteFacts from "./components/PreVoteFacts";

const PRICE_CURVE_HEIGHT_PX = 240;

const PreVoteContestTab: FC = () => {
  const [isPriceCurveOpen, setIsPriceCurveOpen] = useState(false);
  const priceCurvePanelId = useId();
  const areEntriesReady = useEntriesReady();

  return (
    <div className="animate-fade-in mt-5 flex flex-col gap-5">
      <PreVoteFacts
        isPriceCurveOpen={isPriceCurveOpen}
        priceCurvePanelId={priceCurvePanelId}
        onTogglePriceCurve={() => setIsPriceCurveOpen(prev => !prev)}
      />
      {isPriceCurveOpen && (
        <div id={priceCurvePanelId} className="rounded-2xl border border-neutral-3 bg-[#0C0C0C] px-[18px] pb-3.5 pt-4">
          <PriceCurveWrapper height={PRICE_CURVE_HEIGHT_PX} noPadding showAxisLabels />
        </div>
      )}
      <PreVoteDescription />
      {areEntriesReady && (
        <div className="animate-fade-in flex flex-col gap-3.5">
          <PreVoteEntriesHeader />
          <ListProposals />
        </div>
      )}
    </div>
  );
};

export default PreVoteContestTab;
