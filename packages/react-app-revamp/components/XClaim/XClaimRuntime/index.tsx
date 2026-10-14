"use client";

import { useXClaimRuntime } from "@hooks/useXClaim/useXClaimRuntime";
import dynamic from "next/dynamic";

const XClaimSheet = dynamic(() => import("@components/XClaim/XClaimSheet"), { ssr: false });

const XClaimRuntime = () => {
  const { sheet, actions } = useXClaimRuntime();
  return <XClaimSheet sheet={sheet} actions={actions} />;
};

export default XClaimRuntime;
