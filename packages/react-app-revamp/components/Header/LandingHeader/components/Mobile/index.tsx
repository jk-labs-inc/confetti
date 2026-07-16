import LandingPageTicker from "@components/_pages/Landing/components/Ticker";
import LandingHeaderMobileFooter from "./components/Footer";
import LandingHeaderMobileHero from "./components/Hero";

const LandingHeaderMobile = () => {
  return (
    <>
      <LandingPageTicker />
      <LandingHeaderMobileHero />
      <LandingHeaderMobileFooter />
    </>
  );
};

export default LandingHeaderMobile;
