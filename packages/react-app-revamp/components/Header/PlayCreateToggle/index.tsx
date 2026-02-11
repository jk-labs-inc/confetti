import CustomLink from "@components/UI/Link";
import { ROUTE_CREATE_CONTEST, ROUTE_VIEW_LIVE_CONTESTS } from "@config/routes";
import { usePathname } from "next/navigation";
import { FC } from "react";

const PlayCreateToggle: FC = () => {
  const pathname = usePathname();

  const isPlay = !pathname?.includes("/contest/new");

  return (
    <nav
      aria-label="Play or Create toggle"
      className="relative grid w-48 h-8 grid-cols-2 items-center rounded-4xl border border-primary-3 bg-true-black p-1"
    >
      <span
        className={`absolute inset-y-1 w-[93px] rounded-full bg-gradient-purple-pastel transition-all duration-200 ease-in-out ${
          isPlay ? "left-1" : "left-[calc(100%-93px-4px)]"
        }`}
      />
      <CustomLink
        href={ROUTE_VIEW_LIVE_CONTESTS}
        aria-current={isPlay ? "page" : undefined}
        className={`z-10 flex h-full items-center justify-center text-base leading-none font-bold transition-colors duration-200 ${
          isPlay ? "text-true-black" : "text-neutral-9"
        }`}
      >
        play
      </CustomLink>
      <CustomLink
        href={ROUTE_CREATE_CONTEST}
        aria-current={!isPlay ? "page" : undefined}
        className={`z-10 flex h-full items-center justify-center text-base leading-none font-bold transition-colors duration-200 ${
          !isPlay ? "text-true-black" : "text-neutral-9"
        }`}
      >
        create
      </CustomLink>
    </nav>
  );
};

export default PlayCreateToggle;
