import Bill from "@components/HowItWorksExplainer/actors/Bill";
import EntryCard, { entryRowLeft } from "@components/HowItWorksExplainer/actors/EntryCard";
import VoterBubble from "@components/HowItWorksExplainer/actors/VoterBubble";
import { STAGE_STYLE, type SceneProps } from "@components/HowItWorksExplainer/engine";
import { formatDemoDollars } from "lib/howItWorks/demo";
import { FC } from "react";

const CARD_TOP_PX = 12;
const VOTER_ROW_TOP_PX = 150;
const VOTER_SIZE_PX = 36;

const WinnerStill: FC<SceneProps> = ({ script }) => {
  const winner = script.entries[0];
  const voterSeeds = script.pool.deposits.map(deposit => deposit.voterSeed);
  const share = script.pool.final / voterSeeds.length;

  return (
    <div style={STAGE_STYLE} className="relative" aria-hidden>
      {script.entries.map((entry, i) => (
        <EntryCard
          key={entry.id}
          entry={entry}
          rank={entry.rank}
          isHighlighted={entry.id === winner.id}
          isDimmed={entry.id !== winner.id}
          style={{ left: entryRowLeft(i), top: CARD_TOP_PX }}
        />
      ))}
      <div className="absolute inset-x-0 flex justify-center gap-10" style={{ top: VOTER_ROW_TOP_PX }}>
        {voterSeeds.map(seed => (
          <div key={seed} className="relative" style={{ width: VOTER_SIZE_PX, height: VOTER_SIZE_PX }}>
            <Bill label={`+${formatDemoDollars(share)}`} isVisible style={{ left: "50%", top: -30 }} />
            <VoterBubble seed={seed} sizePx={VOTER_SIZE_PX} isVisible />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WinnerStill;
