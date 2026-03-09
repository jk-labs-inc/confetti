import { Avatar } from "@components/UI/Avatar";
import { CheckCircleIcon, DocumentDuplicateIcon, PaperAirplaneIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import { FC, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { formatUnits } from "viem";

interface ProfileSectionProps {
  address: string;
  ensAvatar: string | null | undefined;
  ensName: string | null | undefined;
  displayName: string;
  balance:
    | {
        decimals: number;
        symbol: string;
        value: bigint;
      }
    | undefined;
  onAddFundsClick?: () => void;
  onSendFundsClick?: () => void;
}

const ProfileSection: FC<ProfileSectionProps> = ({ address, ensAvatar, ensName, displayName, balance, onAddFundsClick, onSendFundsClick }) => {
  const [isAddressCopied, setIsAddressCopied] = useState(false);
  const nativeRaw = formatUnits(balance?.value ?? 0n, balance?.decimals ?? 18);
  const { displayValue, displaySymbol, isLoading: isPriceLoading } = useDisplayPrice(nativeRaw, balance?.symbol ?? "ETH");

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
    setIsAddressCopied(true);
    setTimeout(() => {
      setIsAddressCopied(false);
    }, 1000);
  };

  return (
    <div className="p-4 border-b border-neutral-17">
      <div className="flex items-start gap-4">
        <Avatar src={(ensAvatar as string) || ""} size="medium" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex flex-col gap-1">
            <p className="text-[16px] font-bold text-neutral-11">{ensName || displayName}</p>
            <button
              onClick={handleCopyAddress}
              className="flex items-center gap-1 text-[12px] text-neutral-9 hover:text-neutral-11 transition-colors text-left"
            >
              <span>
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              {isAddressCopied ? (
                <CheckCircleIcon className="w-3 h-3 text-positive-11" />
              ) : (
                <DocumentDuplicateIcon className="w-3 h-3 text-neutral-9" />
              )}
            </button>
          </div>
          <div className="flex items-baseline gap-2 flex-wrap text-[14px] font-bold text-neutral-11">
            <span className="text-neutral-9 shrink-0">Balance:</span>
            {isPriceLoading ? (
              <Skeleton width={80} height={14} baseColor="#706f78" highlightColor="#FFE25B" />
            ) : (
              <span className="uppercase whitespace-nowrap">
                {displaySymbol === "$" ? `$${displayValue}` : `${displayValue} ${displaySymbol}`}
              </span>
            )}
          </div>
        </div>
      </div>
      {(onAddFundsClick || onSendFundsClick) && (
        <div className="grid grid-cols-2 gap-2 mt-3">
          {onAddFundsClick && (
            <button
              onClick={onAddFundsClick}
              className="flex flex-col gap-2 items-start p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
            >
              <PlusCircleIcon className="w-5 h-5 text-positive-11" />
              <span className="text-[13px] font-bold text-positive-11">Add Funds</span>
            </button>
          )}
          {onSendFundsClick && (
            <button
              onClick={onSendFundsClick}
              className="flex flex-col gap-2 items-start p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
            >
              <PaperAirplaneIcon className="w-5 h-5 text-neutral-11" />
              <span className="text-[13px] font-bold text-neutral-11">Send Funds</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileSection;
