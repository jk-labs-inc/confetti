"use client";

import { useHowItWorksStore } from "@components/HowItWorksExplainer/store";
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
  const { openCount, close } = useHowItWorksStore(
    useShallow(state => ({ openCount: state.openCount, close: state.close })),
  );

  useEffect(() => close, [pathname, close]);

  return openCount > 0 ? <HowItWorksFrame /> : null;
};

export default HowItWorksLoader;
