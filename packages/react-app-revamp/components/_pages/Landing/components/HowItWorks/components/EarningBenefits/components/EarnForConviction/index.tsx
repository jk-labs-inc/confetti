import { LINK_ROI_CALCULATOR } from "@config/links";
import InteractivePriceCurve from "./components/InteractivePriceCurve";

const EarnForConviction = () => {
  return (
    <div className="flex w-full h-full justify-between">
      <div className="flex flex-col gap-6 h-full">
        <p className="text-2xl lg:text-2xl 2xl:text-3xl font-normal">
          earn more for <span className="text-positive-18 font-bold">your conviction</span>
        </p>
        <div className="flex flex-col flex-1 gap-8 lg:gap-8 2xl:gap-12">
          <div className="flex flex-col gap-4 text-base lg:text-lg 2xl:text-xl text-neutral-11 max-w-[400px]">
            <p className="normal-case">
              confetti's innovation is a <span className="font-bold text-true-white">price curve.</span>
            </p>
            <p>the earlier you vote, the cheaper the votes, and the more you can earn.</p>
            <p>
              but be careful. if you wait too long, you <br className="hidden 2xl:block" />
              might lose money... even if you vote on winners.
            </p>
          </div>
          <a
            href={LINK_ROI_CALCULATOR}
            rel="noopener noreferrer"
            target="_blank"
            className="mt-auto bg-positive-18 text-base text-true-black font-bold normal-case w-[211px] px-4 h-10 flex items-center justify-center rounded-2xl transition-all duration-200 ease-out hover:brightness-110 hover:shadow-[0_0_12px_rgba(255,255,255,0.15)]"
          >
            how to calculate ROI
          </a>
        </div>
      </div>
      <div className="hidden 2xl:block">
        <InteractivePriceCurve />
      </div>
    </div>
  );
};

export default EarnForConviction;
