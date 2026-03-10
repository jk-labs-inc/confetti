import { formatBalance, formatUsd, toFixedString } from "@helpers/formatBalance";
import { useTokenOrNativeBalance } from "@hooks/useBalance";
import useErc20Rates from "@hooks/useCurrency/useErc20Rates";
import useNativeRates from "@hooks/useCurrency/useNativeRates";
import { FilteredToken } from "@hooks/useTokenList";
import { useWallet } from "@hooks/useWallet";
import { ChainWithIcon } from "@config/wagmi";
import { useEffect, useMemo, useState } from "react";
import { FundPoolToken, useFundPoolStore } from "../../../store";
import { generateNativeToken } from "../../../utils";

const getRawBalance = (balance: string) => {
  const parsedBalance = parseFloat(balance);
  if (parsedBalance === 0) return "0";
  return balance;
};

export const getRawTokenSymbol = (
  selectedToken: FilteredToken | null,
  chainNativeCurrencySymbol: string,
  length: "short" | "long",
) => {
  const textLength = length === "short" ? 5 : 20;
  const symbol = selectedToken
    ? selectedToken.symbol.length > textLength
      ? `${selectedToken.symbol.substring(0, textLength)}...`
      : selectedToken.symbol
    : chainNativeCurrencySymbol;
  return symbol;
};

export const getTokenSymbol = (
  selectedToken: FilteredToken | null,
  chainNativeCurrencySymbol: string,
  length: "short" | "long",
) => "$" + getRawTokenSymbol(selectedToken, chainNativeCurrencySymbol, length);

export type InputMode = "crypto" | "usd";

export type SecondaryDisplay = {
  value: string;
  label: string;
  prefix: string;
};

interface UseTokenWidgetParams {
  tokenWidget: FundPoolToken;
  chain: ChainWithIcon;
}

export const useTokenWidget = ({ tokenWidget, chain }: UseTokenWidgetParams) => {
  const { userAddress } = useWallet();
  const nativeCurrency = chain?.nativeCurrency;
  const chainNativeCurrencySymbol = nativeCurrency?.symbol;
  const chainId = chain?.id;
  const { tokenWidgets, setTokenWidgets, setIsError } = useFundPoolStore(state => state);

  const [inputMode, setInputMode] = useState<InputMode>("crypto");
  const [inputValue, setInputValue] = useState(tokenWidget.amount !== "0" ? tokenWidget.amount : "");
  const [isMaxPressed, setIsMaxPressed] = useState(false);
  const [isTokenSearchModalOpen, setIsTokenSearchModalOpen] = useState(false);
  const [localSelectedToken, setLocalSelectedToken] = useState<FilteredToken>(tokenWidget);
  const [isExceedingBalance, setIsExceedingBalance] = useState(false);

  const { data: balance, refetch: refetchBalance } = useTokenOrNativeBalance({
    address: userAddress as `0x${string}`,
    token: localSelectedToken?.address !== "native" ? (localSelectedToken?.address as `0x${string}`) : undefined,
    chainId,
  });

  const balanceDisplay = formatBalance(getRawBalance(balance?.value ?? ""));
  const balanceSymbol = getTokenSymbol(localSelectedToken, chainNativeCurrencySymbol ?? "", "long");

  // --- rate resolution ---

  const isNativeToken = localSelectedToken?.address === "native";
  const erc20Address = !isNativeToken ? localSelectedToken?.address : undefined;
  const { data: nativeRates } = useNativeRates();
  const { data: erc20Rates } = useErc20Rates(erc20Address ? [erc20Address] : [], chain?.name ?? "");

  const rate = useMemo(() => {
    if (isNativeToken) return nativeRates?.[chainNativeCurrencySymbol?.toLowerCase() ?? ""];
    return erc20Rates?.[erc20Address?.toLowerCase() ?? ""];
  }, [isNativeToken, nativeRates, erc20Rates, chainNativeCurrencySymbol, erc20Address]);

  const hasRate = rate !== undefined;

  useEffect(() => {
    if (inputMode === "usd" && !hasRate) {
      setInputMode("crypto");
      setInputValue("");
    }
  }, [inputMode, hasRate]);

  // --- derived values ---

  const cryptoAmount = useMemo(() => {
    if (inputMode === "crypto") return inputValue;
    const val = parseFloat(inputValue);
    if (isNaN(val) || val <= 0 || !rate) return "";
    return toFixedString(val / rate);
  }, [inputValue, inputMode, rate]);

  const tokenSymbol = getRawTokenSymbol(localSelectedToken, chainNativeCurrencySymbol ?? "", "short").toUpperCase();

  const secondaryDisplay = useMemo((): SecondaryDisplay => {
    const val = parseFloat(inputValue);

    if (inputMode === "crypto") {
      if (isNaN(val) || val <= 0 || !rate) return { value: "0", label: "USD", prefix: "$" };
      return { value: formatUsd(val * rate), label: "USD", prefix: "$" };
    }

    if (isNaN(val) || val <= 0 || !rate) return { value: "0", label: tokenSymbol, prefix: "" };
    return { value: formatBalance(toFixedString(val / rate)), label: tokenSymbol, prefix: "" };
  }, [inputValue, inputMode, rate, tokenSymbol]);

  // --- balance check ---

  const totalAmountForToken = useMemo(() => {
    return tokenWidgets.reduce((total, t) => {
      if (t.address === localSelectedToken?.address) {
        return total + parseFloat(t.amount || "0");
      }
      return total;
    }, 0);
  }, [tokenWidgets, localSelectedToken]);

  const isAmountExceedingBalance = (amount: string, bal: string): boolean => {
    const amountNumber = parseFloat(amount);
    const balanceNumber = parseFloat(bal);
    return !isNaN(amountNumber) && !isNaN(balanceNumber) && (amountNumber < 0 || totalAmountForToken > balanceNumber);
  };

  useEffect(() => {
    if (isAmountExceedingBalance(cryptoAmount, balance?.value ?? "")) {
      setIsExceedingBalance(true);
      setIsError(true);
    } else {
      setIsExceedingBalance(false);
      setIsError(false);
    }
  }, [cryptoAmount, balance?.value]);

  const updateStore = (cryptoAmt: string) => {
    const tokenToUpdate = {
      ...localSelectedToken,
      amount: cryptoAmt,
      decimals: balance?.decimals ?? 18,
    };
    const updatedTokens = tokenWidgets.map(w => (w.id === tokenWidget.id ? { ...w, ...tokenToUpdate } : w));
    setTokenWidgets(updatedTokens);
  };

  const handleSelectedToken = (selectedToken: FilteredToken) => {
    setInputMode("crypto");
    setInputValue("");
    setIsMaxPressed(false);

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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsMaxPressed(false);

    if (inputMode === "usd" && rate) {
      const usdVal = parseFloat(value);
      const cryptoAmt = !isNaN(usdVal) && usdVal > 0 ? toFixedString(usdVal / rate) : "";
      updateStore(cryptoAmt);
    } else {
      updateStore(value);
    }
  };

  const handleMaxBalance = () => {
    setInputValue(balance?.value ?? "");
    setInputMode("crypto");
    setIsMaxPressed(true);
    updateStore(balance?.value ?? "");
  };

  const handleToggleInputMode = () => {
    if (!hasRate) return;

    const val = parseFloat(inputValue);
    if (isNaN(val) || val <= 0) {
      setInputMode(prev => (prev === "crypto" ? "usd" : "crypto"));
      setInputValue("");
      return;
    }

    if (inputMode === "crypto") {
      const usdValue = parseFloat((val * rate!).toFixed(2));
      setInputValue(usdValue <= 0 ? "" : String(usdValue));
      setInputMode("usd");
    } else {
      const cryptoValue = parseFloat((val / rate!).toFixed(6));
      setInputValue(cryptoValue <= 0 ? "" : String(cryptoValue));
      setInputMode("crypto");
    }
    setIsMaxPressed(false);
  };

  const handleRemoveWidget = () => {
    if (tokenWidgets.length > 1) {
      const updatedTokens = tokenWidgets.filter(w => w.id !== tokenWidget.id);
      setTokenWidgets(updatedTokens);
    }
  };

  const openTokenSearchModal = () => setIsTokenSearchModalOpen(true);
  const closeTokenSearchModal = () => setIsTokenSearchModalOpen(false);

  return {
    input: {
      value: inputValue,
      mode: inputMode,
      isMaxPressed,
      isExceedingBalance,
      secondaryDisplay,
      hasRate,
    },
    token: {
      selected: localSelectedToken,
      chainNativeCurrencySymbol,
    },
    balance: {
      data: balance,
      display: balanceDisplay,
      symbol: balanceSymbol,
    },
    modal: {
      isOpen: isTokenSearchModalOpen,
    },
    handlers: {
      onAmountChange: handleAmountChange,
      onToggleMode: handleToggleInputMode,
      onMaxBalance: handleMaxBalance,
      onSelectToken: handleSelectedToken,
      onRemoveWidget: handleRemoveWidget,
      onOpenModal: openTokenSearchModal,
      onCloseModal: closeTokenSearchModal,
      onRefreshBalance: refetchBalance,
    },
  };
};
