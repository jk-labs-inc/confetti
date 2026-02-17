import ButtonV3, { ButtonSize } from "@components/UI/ButtonV3";
import { chains } from "@config/wagmi";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { extractPathSegments } from "@helpers/extractPath";
import { transform } from "@helpers/transform";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import { TokenInfo } from "@hooks/useReleasableRewards";
import { useWithdrawReward } from "@hooks/useWithdrawRewards";
import { switchChain } from "@wagmi/core";
import { usePathname } from "next/navigation";
import Skeleton from "react-loading-skeleton";
import { Abi } from "viem";
import { useWallet } from "@hooks/useWallet";

interface ButtonWithdrawErc20RewardProps {
  token: TokenInfo;
  rewardsModuleAddress: string;
  rewardsAbi: Abi;
  onWithdrawStart?: (tokenAddress: string) => void;
  onWithdrawSuccess?: (tokenAddress: string) => void;
  onWithdrawError?: (tokenAddress: string) => void;
}

export const ButtonWithdraw = (props: ButtonWithdrawErc20RewardProps) => {
  const {
    token,
    rewardsModuleAddress: contractRewardsModuleAddress,
    rewardsAbi: abiRewardsModule,
    onWithdrawStart,
    onWithdrawSuccess,
    onWithdrawError,
  } = props;

  const pathname = usePathname();
  const {
    chain: { id: userChainId },
  } = useWallet();
  const { chainName } = extractPathSegments(pathname);
  const chainId = chains.find(chain => chain.name.toLowerCase().replace(" ", "") === chainName.toLowerCase())?.id;
  const isConnectedOnCorrectChain = chainId === userChainId;
  const { handleWithdraw, isLoading } = useWithdrawReward(
    contractRewardsModuleAddress,
    abiRewardsModule,
    token.address,
    token.amount ?? 0n,
    token.decimals ?? 18,
    () => onWithdrawStart?.(token.address),
    () => onWithdrawSuccess?.(token.address),
    () => onWithdrawError?.(token.address),
  );

  const rawAmount = transform(token.amount ?? 0n, token.address, token.decimals ?? 18).toString();
  const tokenAddress = token.address !== "native" ? token.address : undefined;
  const { displayValue, displaySymbol, isLoading: isPriceLoading } = useDisplayPrice(rawAmount, token.symbol, tokenAddress, chainName);

  const onHandleWithdraw = async () => {
    if (!chainId) return;

    if (!isConnectedOnCorrectChain) {
      await switchChain(getWagmiConfig(), { chainId });
    }

    handleWithdraw();
  };

  return (
    <li className="flex items-center">
      <section className="flex justify-between w-full">
        <p>
          {isPriceLoading ? (
            <Skeleton width={80} height={16} baseColor="#706f78" highlightColor="#FFE25B" inline />
          ) : displaySymbol === "$" ? (
            `$${displayValue}`
          ) : (
            <>
              {displayValue} <span className="uppercase">{displaySymbol}</span>
            </>
          )}
        </p>
        <ButtonV3
          isDisabled={isLoading}
          size={ButtonSize.EXTRA_SMALL}
          colorClass="bg-gradient-withdraw"
          onClick={onHandleWithdraw}
        >
          Withdraw
        </ButtonV3>
      </section>
    </li>
  );
};

export default ButtonWithdraw;
