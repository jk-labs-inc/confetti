"use client";

import { isXClaimConfigured } from "@config/xClaim";
import { notFound } from "next/navigation";
import LabFixtureGallery from "./_components/LabFixtureGallery";
import LabRedirectLinks from "./_components/LabRedirectLinks";
import LabStatePanel from "./_components/LabStatePanel";
import LabWorkerPanel from "./_components/LabWorkerPanel";

const XClaimLabPage = () => {
  if (process.env.NODE_ENV !== "development") notFound();

  return (
    <div className="flex min-h-screen flex-col gap-8 bg-true-black p-6 text-[13px] text-neutral-11 md:p-10">
      <h1 className="text-[20px] font-bold">x claim lab</h1>
      {!isXClaimConfigured && (
        <p className="text-negative-11">NEXT_PUBLIC_X_CLAIM_WORKER_URL is not set, so the runtime is off.</p>
      )}
      <LabRedirectLinks />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <LabStatePanel />
        <LabWorkerPanel />
      </div>
      <LabFixtureGallery />
    </div>
  );
};

export default XClaimLabPage;
