"use client";

import { txOverlay, useTransactionOverlayStore } from "@components/UI/TransactionOverlay/store";
import { TransactionOverlayFlow, TransactionOverlayPhase } from "@components/UI/TransactionOverlay/types";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";

const HOLD_DURATIONS = [8, 20, Infinity] as const;

const HOLD_STATES: [TransactionOverlayPhase, string][] = [
  [TransactionOverlayPhase.SIGNING, "1 — signing (check your wallet)"],
  [TransactionOverlayPhase.MINING, "2 — mining (waiting for tx confirmations)"],
  [TransactionOverlayPhase.INDEXING, "3 — indexing (saving to supabase)"],
];

const REWARDS_STEP_LABELS = ["funding reward 1/3", "funding reward 2/3", "funding reward 3/3"];

const SAMPLE_ERROR = "insufficient funds for gas — your wallet needs more eth on base to cover this transaction";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const buttonClassName =
  "rounded-[10px] border border-neutral-17 px-4 py-2 text-left text-[14px] text-neutral-11 hover:border-secondary-11 transition-colors";

export default function TransactionOverlayDevPage() {
  const [flow, setFlow] = useState<TransactionOverlayFlow>(TransactionOverlayFlow.ENTRY);
  const [holdSeconds, setHoldSeconds] = useState<(typeof HOLD_DURATIONS)[number]>(8);
  const { isOpen, phase } = useTransactionOverlayStore(
    useShallow(state => ({ isOpen: state.isOpen, phase: state.phase })),
  );

  // console access for driving states by hand
  useEffect(() => {
    (window as Window & { txOverlay?: typeof txOverlay }).txOverlay = txOverlay;
  }, []);

  // escape hatch for "hold forever" states on desktop
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") txOverlay.dismiss();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (process.env.NODE_ENV !== "development") notFound();

  const scheduleAutoDismiss = () => {
    if (holdSeconds === Infinity) return;
    setTimeout(() => txOverlay.dismiss(), holdSeconds * 1000);
  };

  const holdPhase = (targetPhase: TransactionOverlayPhase) => {
    const steps = flow === TransactionOverlayFlow.REWARDS ? { steps: REWARDS_STEP_LABELS } : undefined;
    txOverlay.start(flow, steps);
    txOverlay.setPhase(targetPhase);
    scheduleAutoDismiss();
  };

  const holdRewardsMidway = () => {
    txOverlay.start(TransactionOverlayFlow.REWARDS, { steps: REWARDS_STEP_LABELS });
    txOverlay.setActiveStep(1);
    scheduleAutoDismiss();
  };

  const holdError = () => {
    txOverlay.start(flow);
    txOverlay.fail(SAMPLE_ERROR);
  };

  const holdSuccess = () => {
    txOverlay.start(flow);
    txOverlay.success(
      flow === TransactionOverlayFlow.VOTE
        ? { id: "vote_submitted", dataAttributes: { "data-vote_revenue_generated": "0.000000" } }
        : undefined,
    );
  };

  const playFullFlow = async () => {
    if (flow === TransactionOverlayFlow.REWARDS) {
      txOverlay.start(TransactionOverlayFlow.REWARDS, { steps: REWARDS_STEP_LABELS });
      for (let i = 0; i < REWARDS_STEP_LABELS.length; i++) {
        txOverlay.setActiveStep(i);
        await delay(2200);
      }
      txOverlay.success();
      return;
    }

    txOverlay.start(flow);
    await delay(2500);
    txOverlay.setPhase(TransactionOverlayPhase.MINING);
    await delay(4500);
    txOverlay.setPhase(TransactionOverlayPhase.INDEXING);
    await delay(2500);
    txOverlay.success();
  };

  return (
    <div className="mx-auto flex max-w-[400px] flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="font-sabo-filled text-[24px] text-neutral-11">transaction overlay lab</h1>
        <p className="text-[14px] text-neutral-14">
          dev-only playground for the full-screen tx wait overlay. best reviewed at mobile width. esc dismisses any
          state.
        </p>
        <p className="text-[12px] text-neutral-14">
          store: {isOpen ? `open — ${phase}` : "closed"}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="font-sabo-filled text-[16px] text-neutral-14">flow</p>
        <div className="flex gap-2">
          {Object.values(TransactionOverlayFlow).map(value => (
            <button
              key={value}
              className={`${buttonClassName} ${flow === value ? "border-secondary-11 text-secondary-11" : ""}`}
              onClick={() => setFlow(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="font-sabo-filled text-[16px] text-neutral-14">hold duration</p>
        <div className="flex gap-2">
          {HOLD_DURATIONS.map(duration => (
            <button
              key={duration}
              className={`${buttonClassName} ${holdSeconds === duration ? "border-secondary-11 text-secondary-11" : ""}`}
              onClick={() => setHoldSeconds(duration)}
            >
              {duration === Infinity ? "forever (esc to close)" : `${duration}s`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="font-sabo-filled text-[16px] text-neutral-14">hold a single state</p>
        {HOLD_STATES.map(([targetPhase, label]) => (
          <button key={targetPhase} className={buttonClassName} onClick={() => holdPhase(targetPhase)}>
            {label}
          </button>
        ))}
        {flow === TransactionOverlayFlow.REWARDS && (
          <button className={buttonClassName} onClick={holdRewardsMidway}>
            2b — rewards steps midway (1 done, 1 active, 1 pending)
          </button>
        )}
        <button className={buttonClassName} onClick={holdSuccess}>
          4 — success (confetti burst, auto-dismisses)
        </button>
        <button className={buttonClassName} onClick={holdError}>
          5 — error (sadboi + got it button)
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <p className="font-sabo-filled text-[16px] text-neutral-14">or watch it end to end</p>
        <button className={`${buttonClassName} border-positive-11 text-positive-11`} onClick={playFullFlow}>
          ▶ play full {flow} flow with realistic timings
        </button>
      </div>
    </div>
  );
}
