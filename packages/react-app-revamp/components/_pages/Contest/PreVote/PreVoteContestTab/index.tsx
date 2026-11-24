import ListProposals from "@components/_pages/ListProposals";
import { useEntriesReady } from "@layouts/LayoutViewContest/hooks/useEntriesReady";
import { FC, useId, useState } from "react";
import PreVoteDescription from "./components/PreVoteDescription";
import PreVoteEntriesHeader from "./components/PreVoteEntriesHeader";
import PreVoteFacts from "../components/PreVoteFacts";
import PreVotePriceCurve from "../components/PreVotePriceCurve";

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
      {isPriceCurveOpen && <PreVotePriceCurve id={priceCurvePanelId} />}
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
