import CustomLink from "@components/UI/Link";
import { ROUTE_VIEW_LIVE_CONTESTS } from "@config/routes";

const LandingHeaderMobileExplainerPlayerSection = () => {
  return (
    <div className="flex flex-col gap-4 px-4">
      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-4">
          <p className="text-neutral-9 font-sabo-filled text-xs">how it works</p>
          <div className="ml-1 flex flex-col gap-2">
            <p className="text-neutral-11 font-sabo-filled text-xs">1. buy votes early for cheap...</p>
            <p className="text-neutral-11 font-sabo-filled text-xs">2. ...TO FUND THE REWARDS POOL</p>
            <p className="text-neutral-11 font-sabo-filled text-xs">3. VOTE UP WINNERS TO EARN REWARDS</p>
          </div>
        </div>
        <img src="/landing/bubbles-ballot.png" alt="player" width={120} height={120} />
      </div>
      <CustomLink
        href={ROUTE_VIEW_LIVE_CONTESTS}
        className="bg-positive-18 rounded-2xl text-base text-true-black px-4 py-2 h-10 w-fit"
      >
        play in contests and earn
      </CustomLink>
    </div>
  );
};

export default LandingHeaderMobileExplainerPlayerSection;
