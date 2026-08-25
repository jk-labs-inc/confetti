"use client";

import InlineTransactionOverlay from "@components/UI/TransactionOverlay/Inline";
import { txOverlay } from "@components/UI/TransactionOverlay/store";
import { TransactionOverlayFlow, TransactionOverlayPhase, TransactionOverlayPlacement } from "@components/UI/TransactionOverlay/types";
import { notFound } from "next/navigation";
import { useState } from "react";

const SAMPLE_ERROR = "insufficient funds for gas * price + value: have 0 want 21000000000000";

const InlineOverlayLabPage = () => {
  const [short, setShort] = useState(false);

  if (process.env.NODE_ENV !== "development") notFound();

  const startInline = () => txOverlay.start(TransactionOverlayFlow.VOTE, { placement: TransactionOverlayPlacement.INLINE });

  const playFullFlow = () => {
    startInline();
    setTimeout(() => txOverlay.setPhase(TransactionOverlayPhase.MINING), 2500);
    setTimeout(() => txOverlay.setPhase(TransactionOverlayPhase.INDEXING), 7000);
    setTimeout(() => txOverlay.success({ id: "vote_submitted" }), 9500);
  };

  if (typeof window !== "undefined") {
    (window as any).txOverlay = txOverlay;
  }

  return (
    <div className="flex min-h-screen items-start gap-10 bg-true-black p-10">
      <div className="flex w-[240px] flex-col gap-2">
        <button className="rounded bg-neutral-17 p-2 text-left text-neutral-11" onClick={startInline}>
          hold: signing
        </button>
        <button
          className="rounded bg-neutral-17 p-2 text-left text-neutral-11"
          onClick={() => {
            startInline();
            txOverlay.setPhase(TransactionOverlayPhase.MINING);
          }}
        >
          hold: mining
        </button>
        <button
          className="rounded bg-neutral-17 p-2 text-left text-neutral-11"
          onClick={() => {
            startInline();
            txOverlay.success({ id: "vote_submitted" });
          }}
        >
          success
        </button>
        <button
          className="rounded bg-neutral-17 p-2 text-left text-neutral-11"
          onClick={() => {
            startInline();
            txOverlay.fail(SAMPLE_ERROR);
          }}
        >
          error
        </button>
        <button className="rounded bg-neutral-17 p-2 text-left text-neutral-11" onClick={playFullFlow}>
          play full flow
        </button>
        <button
          className="rounded bg-neutral-17 p-2 text-left text-neutral-11"
          onClick={() => txOverlay.start(TransactionOverlayFlow.VOTE)}
        >
          fullscreen (mobile) check
        </button>
        <button className="rounded bg-neutral-17 p-2 text-left text-neutral-11" onClick={() => txOverlay.dismiss()}>
          dismiss
        </button>
        <button className="rounded bg-neutral-17 p-2 text-left text-neutral-11" onClick={() => setShort(s => !s)}>
          container: {short ? "short (confirm)" : "tall (vote)"}
        </button>
      </div>

      <div className="w-[480px]">
        <div className="bg-primary-1 rounded-4xl p-4 flex flex-col gap-4">
          <div className="relative px-6 py-4 rounded-4xl flex flex-col gap-4 bg-gradient-voting-area-purple">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-neutral-17" />
              <div className="flex flex-col gap-1">
                <div className="h-4 w-40 rounded bg-neutral-17" />
                <div className="h-3 w-24 rounded bg-neutral-17" />
              </div>
            </div>
            <div className={`${short ? "h-40" : "h-64"} rounded-2xl bg-neutral-17/50`} />
            <div className="h-10 rounded-2xl bg-neutral-17/50" />
            <div className="h-12 rounded-[40px] bg-gradient-purple" />
            <InlineTransactionOverlay />
          </div>
          <div className="h-24 rounded-2xl bg-neutral-17/30" />
        </div>
      </div>
    </div>
  );
};

export default InlineOverlayLabPage;
