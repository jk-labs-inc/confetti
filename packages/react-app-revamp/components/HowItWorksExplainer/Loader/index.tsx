"use client";

import { useHowItWorksStore } from "@components/HowItWorksExplainer/store";
import { useSignedOutOpenSpots } from "@hooks/useXClaim/useSignedOutOpenSpots";
import { readHowItWorksSeen, rememberHowItWorksSeen } from "lib/howItWorks/seen";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";

const loadHowItWorksFrame = () => import("@components/HowItWorksExplainer/Frame");

const HowItWorksFrame = dynamic(loadHowItWorksFrame, { ssr: false });

const CLAIM_STEP_MAX_WAIT_MS = 2500;

export const preloadHowItWorks = () => {
  void loadHowItWorksFrame();
};

const HowItWorksLoader = () => {
  const pathname = usePathname();
  const { openCount, open, close } = useHowItWorksStore(
    useShallow(state => ({ openCount: state.openCount, open: state.open, close: state.close })),
  );

  useEffect(() => close, [pathname, close]);

  const { isResolved: isClaimStepResolved } = useSignedOutOpenSpots();
  const [isClaimStepWaitOver, setIsClaimStepWaitOver] = useState(false);
  const canAutoOpen = isClaimStepResolved || isClaimStepWaitOver;

  useEffect(() => {
    if (readHowItWorksSeen()) return;
    preloadHowItWorks();
    const waitTimer = setTimeout(() => setIsClaimStepWaitOver(true), CLAIM_STEP_MAX_WAIT_MS);
    return () => clearTimeout(waitTimer);
  }, []);

  useEffect(() => {
    if (openCount > 0) rememberHowItWorksSeen();
  }, [openCount]);

  useEffect(() => {
    if (canAutoOpen && !readHowItWorksSeen()) open();
  }, [canAutoOpen, open]);

  return openCount > 0 ? <HowItWorksFrame /> : null;
};

export default HowItWorksLoader;
