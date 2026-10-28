"use client";

import { useHowItWorksStore } from "@components/HowItWorksExplainer/store";
import { readHowItWorksSeen, rememberHowItWorksSeen } from "lib/howItWorks/seen";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useShallow } from "zustand/shallow";

const loadHowItWorksFrame = () => import("@components/HowItWorksExplainer/Frame");

const HowItWorksFrame = dynamic(loadHowItWorksFrame, { ssr: false });

export const preloadHowItWorks = () => {
  void loadHowItWorksFrame();
};

const HowItWorksLoader = () => {
  const pathname = usePathname();
  const { openCount, open, close } = useHowItWorksStore(
    useShallow(state => ({ openCount: state.openCount, open: state.open, close: state.close })),
  );

  useEffect(() => close, [pathname, close]);

  useEffect(() => {
    if (readHowItWorksSeen()) return;
    rememberHowItWorksSeen();
    open();
  }, [open]);

  return openCount > 0 ? <HowItWorksFrame /> : null;
};

export default HowItWorksLoader;
