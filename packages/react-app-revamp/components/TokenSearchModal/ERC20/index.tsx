import { getChainFromId } from "@helpers/getChainFromId";
import { getChainId } from "@helpers/getChainId";
import { getChainLogo } from "@helpers/getChainLogo";
import { FilteredToken, TOKENLISTOOOR_SUPPORTED_CHAIN_IDS } from "@hooks/useTokenList";
import { useWallet } from "@hooks/useWallet";
import { EMPTY_ADDRESS } from "lib/contests/contracts";
import { FC, useState } from "react";
import { formatUnits } from "viem";
import { useBalance } from "wagmi";
import TokenSearchModalChainDropdown from "../components/ChainDropdown";
import TokenSearchModalSearchInput from "../components/SearchInput";
import TokenSearchList from "../components/TokenList";
import TokenSearchListToken from "../components/TokenList/components/Token";
import TokenSearchModalUserTokens from "../components/UserTokens";
import { Option } from "../types";

interface TokenSearchModalERC20Props {
  chains?: Option[];
  chainName?: string;
  chainId?: number;
  hideChains?: boolean;
  onSelectToken?: (token: FilteredToken) => void;
  onSelectChain?: (chain: string) => void;
}
const TokenSearchModalERC20: FC<TokenSearchModalERC20Props> = ({
  chains: erc20Chains,
  chainName: chainNameProp,
  chainId: chainIdProp,
  hideChains,
  onSelectToken,
  onSelectChain,
}) => {
  const [erc20SelectedChain, setErc20SelectedChain] = useState<string>(
    chainNameProp ?? erc20Chains?.[0]?.value ?? "mainnet",
  );
  const [searchValue, setSearchValue] = useState<string>("");

  const resolvedChainName = chainNameProp ?? erc20SelectedChain;
  const resolvedChainId = chainIdProp ?? getChainId(erc20SelectedChain);
  const isChainSupportedBySearch = TOKENLISTOOOR_SUPPORTED_CHAIN_IDS.includes(resolvedChainId);

  const { userAddress } = useWallet();
  const chain = getChainFromId(resolvedChainId);
  const { data: nativeBalance } = useBalance({
    address: userAddress as `0x${string}`,
    chainId: resolvedChainId,
    query: { enabled: !isChainSupportedBySearch && !!userAddress },
  });

  const nativeToken: FilteredToken | null =
    !isChainSupportedBySearch && chain && nativeBalance
      ? {
          address: EMPTY_ADDRESS,
          name: chain.nativeCurrency.symbol,
          symbol: chain.nativeCurrency.symbol,
          decimals: chain.nativeCurrency.decimals,
          logoURI:
            chain.nativeCurrency.symbol.toUpperCase() === "ETH"
              ? "/mainnet.svg"
              : getChainLogo(resolvedChainName) || "/confetti/loader/frame-1.svg",
          balance: parseFloat(formatUnits(nativeBalance.value, nativeBalance.decimals)),
        }
      : null;

  return (
    <div className="flex flex-col gap-8">
      {!hideChains && erc20Chains ? (
        <div className="flex flex-col gap-4">
          <p className="text-[24px] font-bold text-true-white">chain:</p>
          <TokenSearchModalChainDropdown
            defaultOption={erc20Chains[0]}
            options={erc20Chains}
            onChange={option => {
              setErc20SelectedChain(option);
              onSelectChain?.(option);
            }}
          />
        </div>
      ) : null}
      {!hideChains && erc20Chains ? <div className="bg-primary-5 h-[2px]" /> : null}
      {isChainSupportedBySearch ? (
        <>
          <TokenSearchModalSearchInput onSearchChange={value => setSearchValue(value)} chainId={resolvedChainId} />
          {searchValue ? (
            <TokenSearchList searchValue={searchValue} chainId={resolvedChainId} onSelectToken={onSelectToken} />
          ) : (
            <TokenSearchModalUserTokens chainName={resolvedChainName} onSelectToken={onSelectToken} />
          )}
        </>
      ) : nativeToken ? (
        <TokenSearchListToken token={nativeToken} onSelectToken={onSelectToken} />
      ) : null}
    </div>
  );
};

export default TokenSearchModalERC20;
