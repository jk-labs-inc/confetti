"use client";

import dynamic from "next/dynamic";

const XClaimRuntimeLoader = dynamic(() => import("@components/XClaim/XClaimRuntime"), { ssr: false });

export default XClaimRuntimeLoader;
