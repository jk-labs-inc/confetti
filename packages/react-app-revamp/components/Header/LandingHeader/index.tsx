import HowItWorksLoader from "@components/HowItWorksExplainer/Loader";
import LandingHeaderDesktop from "./components/Desktop";
import LandingHeaderMobile from "./components/Mobile";

const LandingHeader = () => {
  return (
    <>
      <div className="md:hidden">
        <LandingHeaderMobile />
      </div>
      <div className="hidden md:block">
        <LandingHeaderDesktop />
      </div>
      <HowItWorksLoader />
    </>
  );
};

export default LandingHeader;
