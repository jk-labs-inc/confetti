import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { FC, RefObject } from "react";
import useProfitCardShare from "../../hooks/useProfitCardShare";

interface ShareDropdownProps {
  cardRef: RefObject<HTMLDivElement | null>;
  profitPercentage: number;
  contestAddress: string;
  chainName: string;
}

const ShareDropdown: FC<ShareDropdownProps> = ({ cardRef, profitPercentage, contestAddress, chainName }) => {
  const { handleSaveImage } = useProfitCardShare({
    cardRef,
    profitPercentage,
    contestAddress,
    chainName,
  });

  return (
    <button
      onClick={handleSaveImage}
      className="flex items-center justify-center w-6 h-4 md:w-10 md:h-6 rounded-[40px] bg-gradient-purple mt-1 md:mt-4 transition-transform active:scale-95"
      aria-label="Save profit card image"
    >
      <ArrowDownTrayIcon className="w-3 h-3 md:w-4 md:h-4 text-true-black" strokeWidth={2.5} />
    </button>
  );
};

export default ShareDropdown;
