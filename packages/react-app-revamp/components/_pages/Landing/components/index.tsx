"use client";

import FeaturedContests from "@components/_pages/FeaturedContests";
import CustomLink from "@components/UI/Link";
import { ROUTE_VIEW_LIVE_CONTESTS } from "@config/routes";
import { isSupabaseConfigured } from "@helpers/database";
import { FeaturedSnapshot } from "lib/contests/featured/types";
import { FC } from "react";
import { useFeaturedContests } from "../hooks/useFeaturedContests";
import LandingPageHowItWorks from "./HowItWorks";

interface LandingPageProps {
  snapshot: FeaturedSnapshot | null;
}

const LandingPage: FC<LandingPageProps> = ({ snapshot }) => {
  const { status, contests, pendingCount, isRewardsFetching, isRetrying, retry } = useFeaturedContests(snapshot);

  return (
    <div className="px-4 mt-6 lx:mt-12 pb-12">
      <div className="flex flex-col gap-12 md:gap-20 max-w-(--landing-content-max-width) mx-auto">
        {isSupabaseConfigured ? (
          <div
            id="featured-contests"
            className="flex flex-col gap-8 w-full lx:w-fit scroll-mt-6 max-md:motion-safe:animate-fade-in max-md:motion-safe:[animation-delay:0.85s]"
          >
            <FeaturedContests
              status={status}
              contests={contests}
              pendingCount={pendingCount}
              isRewardsFetching={isRewardsFetching}
              isRetrying={isRetrying}
              onRetry={retry}
            />
            <CustomLink
              prefetch={true}
              href={ROUTE_VIEW_LIVE_CONTESTS}
              className="ml-auto bg-positive-18 text-base text-true-black font-bold px-4 h-10 hidden md:flex items-center justify-center rounded-2xl transition-all duration-200 ease-out hover:brightness-110 hover:shadow-[0_0_12px_rgba(255,255,255,0.15)]"
            >
              play in contests and earn
            </CustomLink>
          </div>
        ) : (
          <div className="border-neutral-4 animate-appear p-3 rounded-md border-solid border mb-5 text-sm font-bold">
            This site&apos;s current deployment does not have access to Confetti&apos;s reference database of contests,
            but you can check out our Supabase backups{" "}
            <a
              className="link px-1ex"
              href="https://github.com/jk-labs-inc/confetti/tree/staging/packages/supabase"
              target="_blank"
              rel="noreferrer"
            >
              here
            </a>{" "}
            for contest chain and address information!
          </div>
        )}
        <div className="hidden md:block">
          <LandingPageHowItWorks />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
