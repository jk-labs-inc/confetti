import { ROUTE_CREATE_CONTEST } from "@config/routes";
import CustomLink from "@components/UI/Link";
import FundsDistribution from "../FundsDistribution";

const CreateContests = () => {
  return (
    <div className="flex w-full justify-between">
      <div className="flex flex-col gap-6 h-full">
        <p className="text-2xl lg:text-2xl 2xl:text-3xl font-normal">
          <span className="hidden lg:inline">
            and finally... <br />
          </span>
          earn by <span className="text-positive-11 font-bold">creating contests.</span>
        </p>
        <div className="flex flex-col gap-8 lg:gap-8 2xl:gap-12">
          <div className="flex flex-col gap-4 text-base lg:text-lg 2xl:text-xl text-neutral-11 max-w-[400px]">
            <p>create a contest on any subjective question you like.</p>
            <p>
              who was best player in a game? best <br className="hidden 2xl:block" />
              dressed? best personality?
            </p>
            <p>
              opt in to earn 5% of <span className="font-bold text-true-white">all volume</span> on the contest.
            </p>
          </div>
          <div className="block 2xl:hidden">
            <FundsDistribution />
          </div>
          <CustomLink
            href={ROUTE_CREATE_CONTEST}
            className="mt-auto bg-positive-11 text-base text-true-black font-bold normal-case w-[211px] px-2 h-10 flex items-center justify-center rounded-2xl transition-all duration-200 ease-out hover:brightness-110 hover:shadow-[0_0_12px_rgba(255,255,255,0.15)]"
          >
            create a contest and earn
          </CustomLink>
        </div>
      </div>
    </div>
  );
};

export default CreateContests;
