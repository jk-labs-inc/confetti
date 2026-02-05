import { LINK_FAQ } from "@config/links";
import InteractiveEntryCard from "./components/InteractiveEntryCard";

const EarnForBeliefs = () => {
  return (
    <div className="flex w-full h-full justify-between">
      <div className="flex flex-col gap-6 h-full">
        <p className="text-2xl lg:text-2xl 2xl:text-3xl font-normal">
          earn for <span className="text-secondary-11 font-bold">your beliefs</span>
        </p>
        <div className="flex flex-col flex-1 gap-8 lg:gap-8 2xl:gap-12">
          <div className="flex flex-col gap-4 text-base lg:text-lg 2xl:text-xl text-neutral-11 max-w-[400px]">
            <p>buy votes on whatever you believe.</p>
            <p>
              90% of what you spend goes into the <br className="hidden lg:block" />
              rewards pool.
            </p>
            <p>you earn a share of the rewards pool for voting on winners, proportionate to your vote.</p>
          </div>
          <a
            href={LINK_FAQ}
            rel="noopener noreferrer"
            target="_blank"
            className="mt-auto bg-secondary-11 text-base text-true-black font-bold normal-case w-[211px] px-4 h-10 flex items-center justify-center rounded-2xl transition-all duration-200 ease-out hover:brightness-110 hover:shadow-[0_0_12px_rgba(255,255,255,0.15)] cursor-pointer"
          >
            read the FAQ
          </a>
        </div>
      </div>
      <div className="hidden 2xl:block">
        <InteractiveEntryCard />
      </div>
    </div>
  );
};

export default EarnForBeliefs;
