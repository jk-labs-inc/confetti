import LandingPageTicker from "@components/_pages/Landing/components/Ticker";
import CustomLink from "@components/UI/Link";
import Logo from "@components/UI/Logo";
import { ROUTE_CREATE_CONTEST } from "@config/routes";

const LandingHeaderDesktop = () => {
  return (
    <>
      <LandingPageTicker />
      <header className="pl-8 3xl:pl-20 mt-6">
        <div className="grid grid-cols-[auto_1fr] items-center gap-x-6 max-w-(--landing-content-max-width)">
          <CustomLink href="/">
            <Logo />
          </CustomLink>

          <div className="flex items-center mt-4 ml-auto">
            <CustomLink
              prefetch={true}
              href={ROUTE_CREATE_CONTEST}
              className="bg-secondary-11 text-base text-true-black font-bold px-4 h-10 md:flex items-center justify-center rounded-2xl transition-all duration-200 ease-out hover:brightness-110 hover:shadow-[0_0_12px_rgba(255,255,255,0.15)]"
            >
              create a contest and earn
            </CustomLink>
          </div>

          <p className="text-secondary-11 text-[18.8px] font-sabo-filled">vote. rally. earn.</p>
        </div>
      </header>
    </>
  );
};

export default LandingHeaderDesktop;
