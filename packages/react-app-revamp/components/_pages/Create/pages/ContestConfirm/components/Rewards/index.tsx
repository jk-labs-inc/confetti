import { returnOnlySuffix } from "@helpers/ordinalSuffix";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import { RewardPoolData } from "@hooks/useDeployContest/slices/contestCreateRewards";
import { FC, useMemo } from "react";
import { useFundPoolStore } from "@components/_pages/Create/pages/ContestRewards/components/FundPool/store";
import CreateContestConfirmLayout from "../Layout";

interface TokenAmountDisplayProps {
  amount: string;
  symbol: string;
}

const TokenAmountDisplay: FC<TokenAmountDisplayProps> = ({ amount, symbol }) => {
  const { displayValue, displaySymbol } = useDisplayPrice(amount, symbol);

  if (displaySymbol === "$") return <>${displayValue}</>;
  return (
    <>
      {displayValue} {displaySymbol.toLowerCase()}
    </>
  );
};

interface CreateContestConfirmRewardsProps {
  step: number;
  rewardPoolData: RewardPoolData;
  addFundsToRewards: boolean;
  onClick: (step: number) => void;
}

const CreateContestConfirmRewards: FC<CreateContestConfirmRewardsProps> = ({
  step,
  rewardPoolData,
  addFundsToRewards,
  onClick,
}) => {
  const { recipients } = rewardPoolData;
  const tokenWidgets = useFundPoolStore(state => state.tokenWidgets);

  const validTokens = useMemo(() => {
    if (!addFundsToRewards || tokenWidgets.length === 0) return [];

    return tokenWidgets.filter(token => token.amount && token.amount !== "0" && token.amount !== "" && token.symbol);
  }, [addFundsToRewards, tokenWidgets]);

  return (
    <CreateContestConfirmLayout onClick={() => onClick?.(step)}>
      <div className="flex flex-col gap-2">
        <p className="text-neutral-9 text-[12px] font-bold uppercase">rewards</p>
        <ul className="flex flex-col pl-6 list-disc">
          {recipients.map(recipient => (
            <li key={recipient.id} className="text-[16px]">
              {recipient.proportion}% to {recipient.place}
              <sup className="ml-px text-xs">{returnOnlySuffix(recipient.place)}</sup> place voters
            </li>
          ))}
          {validTokens.length > 0 && (
            <li className="text-[16px]">
              seeded with{" "}
              {validTokens.map((token, index) => (
                <span key={token.symbol}>
                  <TokenAmountDisplay amount={token.amount} symbol={token.symbol} />
                  {index < validTokens.length - 1 && ", "}
                </span>
              ))}{" "}
              rewards pool
            </li>
          )}
        </ul>
      </div>
    </CreateContestConfirmLayout>
  );
};

export default CreateContestConfirmRewards;
