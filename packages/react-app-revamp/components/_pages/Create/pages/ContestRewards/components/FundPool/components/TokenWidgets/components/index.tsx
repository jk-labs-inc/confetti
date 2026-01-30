/* eslint-disable @next/next/no-img-element */
import TokenSearchModal from "@components/TokenSearchModal";
import { ChainWithIcon } from "@config/wagmi";
import { formatBalance } from "@helpers/formatBalance";
import { ArrowPathIcon, ChevronDownIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useTokenOrNativeBalance } from "@hooks/useBalance";
import { FilteredToken } from "@hooks/useTokenList";
import { FC, useEffect, useMemo, useState } from "react";
import { FundPoolToken, useFundPoolStore } from "../../../store";
import { generateNativeToken } from "../../../utils";
import { useWallet } from "@hooks/useWallet";

interface TokenWidgetProps {
  tokenWidget: FundPoolToken;
  index: number;
  chain: ChainWithIcon;
}

const getFormattedBalance = (balance: string) => {
  const parsedBalance = parseFloat(balance);
  if (parsedBalance === 0) return "0";
  if (parsedBalance < 0.001) return "< 0.001";
  return formatBalance(balance);
};

const getTokenSymbol = (
  selectedToken: FilteredToken | null,
  chainNativeCurrencySymbol: string,
  length: "short" | "long",
) => {
  const textLength = length === "short" ? 5 : 20;
  return selectedToken
    ? selectedToken.symbol.length > textLength
      ? `${selectedToken.symbol.substring(0, textLength)}...`
      : selectedToken.symbol
    : chainNativeCurrencySymbol;
};

const TokenWidget: FC<TokenWidgetProps> = ({ tokenWidget, index, chain }) => {
  const { userAddress } = useWallet();
  const chainLogo = chain?.iconUrl;
  const nativeCurrency = chain?.nativeCurrency;
  const chainNativeCurrencySymbol = nativeCurrency?.symbol;
  const chainId = chain?.id;
  const { tokenWidgets, setTokenWidgets, setIsError } = useFundPoolStore(state => state);
  const [localAmount, setLocalAmount] = useState(tokenWidget.amount !== "0" ? tokenWidget.amount : "");
  const [isMaxPressed, setIsMaxPressed] = useState<boolean>(false);
  const isEtherChainNativeCurrency = chainNativeCurrencySymbol === "ETH";
  const [isTokenSearchModalOpen, setIsTokenSearchModalOpen] = useState(false);
  const [localSelectedToken, setLocalSelectedToken] = useState<FilteredToken>(tokenWidget);
  const { data: balance, refetch: refetchBalance } = useTokenOrNativeBalance({
    address: userAddress as `0x${string}`,
    token: localSelectedToken?.address !== "native" ? (localSelectedToken?.address as `0x${string}`) : undefined,
    chainId: chainId,
  });
  const [isExceedingBalance, setIsExceedingBalance] = useState(false);

  useEffect(() => {
    if (isAmountExceedingBalance(localAmount, balance?.value ?? "")) {
      setIsExceedingBalance(true);
      setIsError(true);
    } else {
      setIsExceedingBalance(false);
      setIsError(false);
    }
  }, [localAmount, balance?.value]);

  const totalAmountForToken = useMemo(() => {
    return tokenWidgets.reduce((total, t) => {
      if (t.address === localSelectedToken?.address) {
        return total + parseFloat(t.amount || "0");
      }
      return total;
    }, 0);
  }, [tokenWidgets, localSelectedToken]);

  const handleSelectedToken = (selectedToken: FilteredToken) => {
    if (selectedToken.symbol === chainNativeCurrencySymbol) {
      setLocalSelectedToken(generateNativeToken(nativeCurrency, chainNativeCurrencySymbol));
      const updatedTokens = tokenWidgets.map(w =>
        w.id === tokenWidget.id ? { ...w, ...generateNativeToken(nativeCurrency, chainNativeCurrencySymbol) } : w,
      );
      setTokenWidgets(updatedTokens);
    } else {
      setLocalSelectedToken(selectedToken);
      const updatedTokens = tokenWidgets.map(w =>
        w.id === tokenWidget.id ? { ...w, ...selectedToken, amount: "", decimals: selectedToken.decimals || 18 } : w,
      );
      setTokenWidgets(updatedTokens);
    }
    setIsTokenSearchModalOpen(false);
  };

  const handleOpenTokenSearchModal = () => {
    setIsTokenSearchModalOpen(!isTokenSearchModalOpen);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    setLocalAmount(amount);
    setIsMaxPressed(false);

    const tokenToUpdate = {
      ...localSelectedToken,
      amount: amount,
      decimals: balance?.decimals ?? 18,
    };

    const updatedTokens = tokenWidgets.map(w => (w.id === tokenWidget.id ? { ...w, ...tokenToUpdate } : w));
    setTokenWidgets(updatedTokens);
  };

  const isAmountExceedingBalance = (amount: string, balance: string): boolean => {
    const amountNumber = parseFloat(amount);
    const balanceNumber = parseFloat(balance);
    return !isNaN(amountNumber) && !isNaN(balanceNumber) && (amountNumber < 0 || totalAmountForToken > balanceNumber);
  };

  const handleMaxBalance = () => {
    setLocalAmount(balance?.value ?? "");
    setIsMaxPressed(true);

    const tokenToUpdate = {
      ...localSelectedToken,
      amount: balance?.value ?? "",
      decimals: balance?.decimals ?? 18,
    };

    const updatedTokens = tokenWidgets.map(w => (w.id === tokenWidget.id ? { ...w, ...tokenToUpdate } : w));
    setTokenWidgets(updatedTokens);
  };

  const handleRemoveWidget = () => {
    if (tokenWidgets.length > 1) {
      const updatedTokens = tokenWidgets.filter(w => w.id !== tokenWidget.id);
      setTokenWidgets(updatedTokens);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 md:w-[400px] relative">
        <div className="bg-true-black rounded-[32px] flex flex-col items-center justify-center shadow-file-upload  animate-appear">
          <div className="p-6">
            <div className="w-80 md:w-[360px] h-32 rounded-[16px] bg-neutral-2 pr-4 pl-6 pt-2 pb-4">
              <div className="flex flex-col gap-2">
                <div className={`flex flex-row ${index > 0 ? "justify-between" : "justify-end"}`}>
                  {index > 0 ? (
                    <button onClick={handleRemoveWidget}>
                      <TrashIcon className="w-5 h-5 text-negative-11 hover:text-negative-10 transition-colors duration-300 ease-in-out" />
                    </button>
                  ) : null}
                  <div className="flex justify-end">
                    <img
                      src={chainLogo?.toString() ?? ""}
                      alt="chain-logo"
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <input
                      min={0}
                      type="number"
                      className={`text-[32px] w-2/3 placeholder-neutral-10 placeholder-bold bg-transparent border-none focus:outline-none ${
                        isExceedingBalance ? "text-negative-11" : "text-neutral-11"
                      }`}
                      placeholder="0.00"
                      onChange={handleAmountChange}
                      value={isMaxPressed ? formatBalance(balance?.value ?? "") : localAmount}
                      autoFocus
                    />
                    <div
                      className="flex items-center gap-1 p-1 bg-primary-5 border border-neutral-10 rounded-[10px] cursor-pointer"
                      onClick={handleOpenTokenSearchModal}
                    >
                      {localSelectedToken && localSelectedToken.address !== "native" ? (
                        <img
                          src={localSelectedToken?.logoURI ?? ""}
                          alt="tokenLogo"
                          className="rounded-full"
                          width={16}
                          height={16}
                        />
                      ) : isEtherChainNativeCurrency ? (
                        <img src="/tokens/ether.svg" alt="ether" width={16} height={16} />
                      ) : (
                        <img src="/confetti/loader/frame-1.svg" alt="ether" width={16} height={16} />
                      )}

                      <p className="text-[16px] text-neutral-11 font-bold uppercase">
                        {getTokenSymbol(localSelectedToken, chainNativeCurrencySymbol ?? "", "short")}
                      </p>
                      <ChevronDownIcon className="w-5 h-5 text-neutral-11" />
                    </div>
                  </div>
                  <div className="flex gap-2 items-center group">
                    <p className="text-[16px] text-neutral-14 font-bold">
                      balance: {getFormattedBalance(balance?.value ?? "")}{" "}
                      <span className="uppercase">
                        {getTokenSymbol(localSelectedToken, chainNativeCurrencySymbol ?? "", "long")}
                      </span>
                    </p>

                    {balance?.value && parseFloat(balance.value) > 0 ? (
                      <div
                        className="w-12 text-center rounded-[10px] border items-center border-positive-11 hover:border-2 cursor-pointer"
                        onClick={handleMaxBalance}
                      >
                        <p className="text-[12px] text-positive-11 infinite-submissions uppercase">max</p>
                      </div>
                    ) : null}
                    <ArrowPathIcon
                      className="w-5 h-5 text-neutral-14 hover:text-neutral-11 transition-all cursor-pointer opacity-0 group-hover:opacity-100 duration-300"
                      onClick={() => refetchBalance()}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TokenSearchModal
        chains={[{ label: chain?.name ?? "", value: chain?.name ?? "" }]}
        isOpen={isTokenSearchModalOpen}
        onClose={() => setIsTokenSearchModalOpen(false)}
        onSelectToken={handleSelectedToken}
        hideChains
      />
    </>
  );
};

export default TokenWidget;
