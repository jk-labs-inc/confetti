import CustomLink from "@components/UI/Link";
import { ROUTE_CREATE_CONTEST } from "@config/routes";

const LandingHeaderMobileExplainerCreatorSection = () => {
  return (
    <div className="flex flex-col gap-6">
      <img src="/landing/path.svg" alt="creator" />
      <div className="flex items-center gap-4 px-4">
        <img src="/landing/bubbles-money.png" alt="creator" width={114} height={114} />
        <div className="flex flex-col gap-4">
          <p className="text-neutral-11 font-sabo-filled text-xs">or create a contest...</p>
          <CustomLink
            href={ROUTE_CREATE_CONTEST}
            className="bg-secondary-11 rounded-2xl text-base text-true-black px-4 py-2 h-10 w-fit"
          >
            create a contest and earn
          </CustomLink>
        </div>
      </div>
      <img src="/landing/path.svg" alt="creator" />
    </div>
  );
};

export default LandingHeaderMobileExplainerCreatorSection;
