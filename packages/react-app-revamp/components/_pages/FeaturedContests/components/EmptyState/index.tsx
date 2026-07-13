import CustomLink from "@components/UI/Link";
import { ROUTE_CREATE_CONTEST } from "@config/routes";

const FeaturedContestsEmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full lx:w-(--landing-content-max-width) min-h-[220px] md:min-h-[280px] px-6 py-12 rounded-2xl border border-neutral-7 bg-[#141414] animate-appear">
      <p className="font-sabo-filled italic text-[20px] md:text-[24px] text-neutral-9 text-center">
        no featured contests right now
      </p>
      <p className="text-sm text-neutral-10 text-center">check back soon — or start one yourself</p>
      <CustomLink
        prefetch={true}
        href={ROUTE_CREATE_CONTEST}
        className="mt-2 flex items-center justify-center h-10 px-4 rounded-2xl border border-neutral-7 text-sm font-bold text-neutral-11 hover:border-neutral-10 transition-colors duration-200"
      >
        create a contest
      </CustomLink>
    </div>
  );
};

export default FeaturedContestsEmptyState;
