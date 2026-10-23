import Bill, { BILL_HEIGHT_PX } from "@components/HowItWorksExplainer/actors/Bill";
import EntryCard, { ENTRY_CARD_SIZE_PX, entryRowLeft } from "@components/HowItWorksExplainer/actors/EntryCard";
import RewardsPool, {
  REWARDS_POOL_HEIGHT_PX,
  REWARDS_POOL_WIDTH_PX,
} from "@components/HowItWorksExplainer/actors/RewardsPool";
import VoterBubble from "@components/HowItWorksExplainer/actors/VoterBubble";
import {
  STAGE_STYLE,
  STAGE_WIDTH_PX,
  defineActors,
  useScene,
  type SceneProps,
} from "@components/HowItWorksExplainer/engine";
import { formatDemoDollars, type DemoScript } from "lib/howItWorks/demo";
import { useMotionValue, type AnimationSequence, type MotionValue } from "motion/react";
import { FC, Fragment } from "react";

const actors = defineActors(["entry", "voter", "bill", "toPool", "fee", "pool", "fill", "legend"] as const);

const CARD_TOP_PX = 12;
const VOTER_SIZE_PX = 28;
const VOTER_OVERHANG_PX = 10;
const POOL_TOP_PX = 128;
const POOL_LEFT_PX = (STAGE_WIDTH_PX - REWARDS_POOL_WIDTH_PX) / 2;
const POOL_MOUTH = { x: STAGE_WIDTH_PX / 2, y: POOL_TOP_PX - BILL_HEIGHT_PX / 2 };
const LEGEND_TOP_PX = POOL_TOP_PX + REWARDS_POOL_HEIGHT_PX + 6;
const BILL_START_Y_PX = CARD_TOP_PX + ENTRY_CARD_SIZE_PX - BILL_HEIGHT_PX / 2;
const SPLIT_PROGRESS = 0.6;
const FEE_DRIFT = { x: 64, y: -12 };
const MAX_FILL = 0.9;

const DEPOSIT_START_S = 0.1;
const DEPOSIT_EVERY_S = 1.35;
const VOTER_POP_S = 0.35;
const BILL_POP_S = 0.25;
const BILL_TRAVEL_S = 0.3;
const SPLIT_TRAVEL_S = 0.35;
const POOL_LAND_S = 0.45;
const FINALE_GAP_S = 0.2;

const cardCenterX = (entryIndex: number) => entryRowLeft(entryIndex) + ENTRY_CARD_SIZE_PX / 2;

const splitPoint = (entryIndex: number) => {
  const startX = cardCenterX(entryIndex);
  return {
    x: startX + (POOL_MOUTH.x - startX) * SPLIT_PROGRESS,
    y: BILL_START_Y_PX + (POOL_MOUTH.y - BILL_START_Y_PX) * SPLIT_PROGRESS,
  };
};

const entryIndexOf = (script: DemoScript, entryId: string) => script.entries.findIndex(entry => entry.id === entryId);

const buildTimeline = (script: DemoScript, poolAmount: MotionValue<number>): AnimationSequence => {
  const { deposits } = script.pool;
  const timeline: AnimationSequence = [];

  deposits.forEach((deposit, k) => {
    const entryIndex = entryIndexOf(script, deposit.entryId);
    const split = splitPoint(entryIndex);
    const at = DEPOSIT_START_S + k * DEPOSIT_EVERY_S;
    const billAt = at + VOTER_POP_S * 0.6;
    const splitAt = billAt + BILL_POP_S + BILL_TRAVEL_S;
    const landAt = splitAt + SPLIT_TRAVEL_S;
    const fillFrom = (k / deposits.length) * MAX_FILL;
    const fillTo = ((k + 1) / deposits.length) * MAX_FILL;
    const poolFrom = deposit.poolAfter - deposit.toPool;

    timeline.push(
      [
        actors.sel("voter", k),
        { opacity: [0, 1], scale: [0.3, 1], y: [-14, 0] },
        { at, type: "spring", bounce: 0.6, duration: VOTER_POP_S },
      ],
      [actors.sel("entry", entryIndex), { scale: [1, 0.92, 1.05, 1] }, { at: billAt, duration: 0.35 }],
      [
        actors.sel("bill", k),
        { opacity: [0, 1], scale: [0.6, 1], y: [8, 0] },
        { at: billAt, duration: BILL_POP_S },
      ],
      [
        actors.sel("bill", k),
        { x: [0, split.x - cardCenterX(entryIndex)], y: [0, split.y - BILL_START_Y_PX] },
        { at: billAt + BILL_POP_S, duration: BILL_TRAVEL_S, ease: "easeInOut" },
      ],
      [actors.sel("bill", k), { opacity: [1, 0] }, { at: splitAt, duration: 0.05 }],
      [actors.sel("toPool", k), { opacity: [0, 1] }, { at: splitAt, duration: 0.05 }],
      [
        actors.sel("toPool", k),
        { x: [0, POOL_MOUTH.x - split.x], y: [0, POOL_MOUTH.y - split.y], scale: [1, 0.7] },
        { at: splitAt, duration: SPLIT_TRAVEL_S, ease: "easeIn" },
      ],
      [actors.sel("toPool", k), { opacity: [1, 0] }, { at: landAt - 0.05, duration: 0.08 }],
      [
        actors.sel("fee", k),
        { opacity: [0, 1, 0], x: [0, FEE_DRIFT.x * 0.5, FEE_DRIFT.x], y: [0, FEE_DRIFT.y * 0.6, FEE_DRIFT.y] },
        { at: splitAt, duration: 0.7, ease: "easeOut" },
      ],
      [actors.sel("pool"), { scale: [1, 1.06, 1] }, { at: landAt, duration: 0.3 }],
      [actors.sel("fill"), { scaleY: [fillFrom, fillTo] }, { at: landAt, duration: POOL_LAND_S }],
      [poolAmount, [poolFrom, deposit.poolAfter], { at: landAt, duration: POOL_LAND_S, ease: "easeOut" }],
    );
  });

  timeline.push(
    [
      actors.sel("pool"),
      { scale: [1, 1.12, 1] },
      { at: `+${FINALE_GAP_S}`, type: "spring", bounce: 0.5, duration: 0.5 },
    ],
    [actors.sel("legend"), { opacity: [0, 1], y: [4, 0] }, { at: "<", duration: 0.3 }],
  );

  return timeline;
};

const PoolScene: FC<SceneProps> = ({ script }) => {
  const poolAmount = useMotionValue(0);
  const scope = useScene<HTMLDivElement>(() => buildTimeline(script, poolAmount));

  return (
    <div ref={scope} style={STAGE_STYLE} className="relative" aria-hidden>
      {script.entries.map((entry, i) => (
        <EntryCard
          key={entry.id}
          {...actors.attr("entry", i)}
          entry={entry}
          style={{ left: entryRowLeft(i), top: CARD_TOP_PX }}
        />
      ))}
      <RewardsPool
        {...actors.attr("pool")}
        fillActor={actors.attr("fill")}
        amount={poolAmount}
        style={{ left: POOL_LEFT_PX, top: POOL_TOP_PX }}
      />
      {script.pool.deposits.map((deposit, k) => {
        const entryIndex = entryIndexOf(script, deposit.entryId);
        const split = splitPoint(entryIndex);
        const splitStyle = { left: split.x, top: split.y };
        return (
          <Fragment key={k}>
            <VoterBubble
              {...actors.attr("voter", k)}
              seed={deposit.voterSeed}
              sizePx={VOTER_SIZE_PX}
              style={{
                left: entryRowLeft(entryIndex) + ENTRY_CARD_SIZE_PX - VOTER_SIZE_PX + VOTER_OVERHANG_PX,
                top: CARD_TOP_PX - VOTER_OVERHANG_PX,
              }}
            />
            <Bill
              {...actors.attr("bill", k)}
              label={`+${formatDemoDollars(deposit.spend)}`}
              style={{ left: cardCenterX(entryIndex), top: BILL_START_Y_PX }}
            />
            <Bill {...actors.attr("toPool", k)} label={formatDemoDollars(deposit.toPool)} style={splitStyle} />
            <Bill {...actors.attr("fee", k)} label={formatDemoDollars(deposit.skimmed)} tone="fee" style={splitStyle} />
          </Fragment>
        );
      })}
      <p
        {...actors.attr("legend")}
        style={{ top: LEGEND_TOP_PX }}
        className="absolute inset-x-0 text-center text-[11px] font-bold text-neutral-9 opacity-0"
      >
        {script.contest.percentageToRewards}% of every vote goes to the pool
      </p>
    </div>
  );
};

export default PoolScene;
