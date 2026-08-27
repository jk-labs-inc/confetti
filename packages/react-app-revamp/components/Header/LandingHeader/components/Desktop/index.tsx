import LandingPageTicker from "@components/_pages/Landing/components/Ticker";
import CustomLink from "@components/UI/Link";
import Logo from "@components/UI/Logo";
import { LINK_TELEGRAM } from "@config/links";
import { ROUTE_CREATE_CONTEST } from "@config/routes";

const LandingHeaderDesktop = () => {
  return (
    <>
      <LandingPageTicker />
      <header className="mt-6 px-4">
        <div className="grid grid-cols-[auto_1fr] items-center gap-x-6 max-w-(--landing-content-max-width) mx-auto">
          <CustomLink href="/">
            <Logo />
          </CustomLink>

          <div className="flex items-center gap-4 mt-4 ml-auto">
            <CustomLink
              prefetch={false}
              href={LINK_TELEGRAM}
              target="_blank"
              className="w-28 h-10 shrink-0 flex items-center justify-center rounded-2xl border border-secondary-11 text-base text-secondary-11 font-bold transition-all duration-200 ease-out hover:bg-secondary-11/10"
            >
              telegram
            </CustomLink>
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
