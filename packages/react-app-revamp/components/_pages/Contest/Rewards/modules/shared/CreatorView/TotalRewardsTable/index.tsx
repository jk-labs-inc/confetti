import RewardsNumberDisplay from "@components/_pages/Contest/Rewards/components/UI/Display/Number";
import DualPriceDisplay from "@components/UI/DualPriceDisplay";
import { returnOnlySuffix } from "@helpers/ordinalSuffix";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import { RankShare, TotalRewardsData } from "lib/rewards/types";
import { FC } from "react";
import { formatUnits } from "viem";

const NativeRewardCell: FC<{ amount: string; symbol: string }> = ({ amount, symbol }) => {
  const { displayValue, displaySymbol, isLoading } = useDisplayPrice(amount, symbol);

  return (
    <p>
      <DualPriceDisplay displayValue={displayValue} displaySymbol={displaySymbol} secondaryValue={null} secondarySymbol={null} isLoading={isLoading} />
    </p>
  );
};

const TokenRewardCell: FC<{ amount: string; symbol: string; address: string; isLast: boolean }> = ({
  amount,
  symbol,
  address,
  isLast,
}) => {
  const { contestConfig } = useContestConfigStore(state => state);
  const { displayValue, displaySymbol, isLoading } = useDisplayPrice(amount, symbol, address, contestConfig.chainName);

  return (
    <div key={address} className="text-[14px] font-bold">
      <DualPriceDisplay displayValue={displayValue} displaySymbol={displaySymbol} secondaryValue={null} secondarySymbol={null} isLoading={isLoading} />
      {!isLast ? ", " : ""}
    </div>
  );
};

interface TotalRewardsTableProps {
  totalRewards: TotalRewardsData;
  shares: RankShare[];
}

const TotalRewardsTable = ({ totalRewards, shares }: TotalRewardsTableProps) => {
  const { contestConfig } = useContestConfigStore(state => state);
  const totalSharesValue = shares.reduce((acc, { share }) => acc + share, 0n);
  const { value: totalValue, symbol, decimals } = totalRewards?.native || { value: 0n, symbol: "ETH", decimals: 18 };

  const tokenEntries = Object.entries(totalRewards?.tokens || {});

  const ranksWithPercentage = shares.map(({ rank, share }) => {
    const percentage = totalSharesValue > 0n ? Number((share * 100n) / totalSharesValue) : 0;

    const rewardValue = totalSharesValue > 0n ? (totalValue * share) / totalSharesValue : 0n;
    const formattedReward = formatUnits(rewardValue, decimals);

    const tokenRewards = tokenEntries.map(([address, tokenData]) => {
      const tokenRewardValue = totalSharesValue > 0n ? (tokenData.value * share) / totalSharesValue : 0n;
      const formattedTokenReward = formatUnits(tokenRewardValue, tokenData.decimals);

      return {
        address,
        symbol: tokenData.symbol,
        amount: formattedTokenReward,
        decimals: tokenData.decimals,
      };
    });

    return {
      rank,
      percentage,
      rewardAmount: formattedReward,
      tokenRewards,
    };
  });

  ranksWithPercentage.sort((a, b) => a.rank - b.rank);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <RewardsNumberDisplay value={totalValue} symbol={symbol} decimals={decimals} index={0} isBold={true} />

        {tokenEntries.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tokenEntries.map(([address, tokenData], index) => (
              <RewardsNumberDisplay
                key={address}
                value={tokenData.value}
                symbol={tokenData.symbol}
                decimals={tokenData.decimals}
                index={index + 1}
                isBold={true}
                tokenAddress={address}
                chainName={contestConfig.chainName}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {ranksWithPercentage.map(({ rank, percentage, rewardAmount, tokenRewards }, idx) => (
          <div
            key={rank}
            className={`flex flex-col gap-2 text-neutral-9 ${
              idx !== ranksWithPercentage.length - 1 ? "border-b border-primary-2 pb-2" : ""
            }`}
          >
            <div className="flex justify-between items-center text-[16px] font-bold">
              <p>
                {rank}
                <sup>{returnOnlySuffix(rank)}</sup> place voters ({percentage}%)
              </p>
              <NativeRewardCell amount={rewardAmount} symbol={symbol} />
            </div>

            {tokenRewards.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-end">
                {tokenRewards.map((tokenReward, index) => (
                  <TokenRewardCell
                    key={tokenReward.address}
                    amount={tokenReward.amount}
                    symbol={tokenReward.symbol}
                    address={tokenReward.address}
                    isLast={index === tokenRewards.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TotalRewardsTable;
