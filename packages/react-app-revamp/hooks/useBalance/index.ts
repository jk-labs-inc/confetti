import { chainHasNativeCoin } from "lib/voteCurrency";
import { erc20Abi, formatUnits } from "viem";
import { useBalance, useReadContracts } from "wagmi";

export function useTokenOrNativeBalance({
  address,
  token,
  chainId,
}: {
  address: `0x${string}`;
  token?: `0x${string}`;
  chainId?: number;
}) {
  const nativeBalance = useBalance({
    address,
    chainId,
    query: {
      select(data) {
        const formatted = formatUnits(data.value, data.decimals);
        return {
          value: formatted,
          decimals: data.decimals,
        };
      },
      enabled: !token && chainHasNativeCoin(chainId),
    },
  });

  const tokenBalance = useReadContracts({
    contracts: [
      {
        address: token!,
        abi: erc20Abi,
        chainId,
        functionName: "balanceOf",
        args: [address],
      },
      {
        address: token!,
        abi: erc20Abi,
        chainId,
        functionName: "decimals",
      },
    ],
    allowFailure: false,
    query: {
      select(data) {
        const formatted = formatUnits(data[0], data[1]);
        return {
          value: formatted,
          decimals: data[1],
        };
      },
    },
  });

  return token ? tokenBalance : nativeBalance;
}
