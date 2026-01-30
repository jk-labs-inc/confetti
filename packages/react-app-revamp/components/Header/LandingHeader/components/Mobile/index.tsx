import LandingPageTicker from "@components/_pages/Landing/components/Ticker";
import CustomLink from "@components/UI/Link";
import LandingHeaderMobileFooter from "./components/Footer";
import LandingHeaderMobileExplainer from "./components/Explainer";
import Logo from "@components/UI/Logo";

const LandingHeaderMobile = () => {
  return (
    <>
      <div className="mt-3">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1 pl-4">
            <CustomLink href="/">
              <Logo />
            </CustomLink>
            <p className="text-secondary-11 text-[18.8px] font-sabo-filled">vote. rally. earn.</p>
          </div>

          <div className="flex flex-col gap-8">
            <LandingPageTicker />
            <LandingHeaderMobileExplainer />
          </div>
        </div>

        <LandingHeaderMobileFooter />
      </div>
    </>
  );
};

export default LandingHeaderMobile;
