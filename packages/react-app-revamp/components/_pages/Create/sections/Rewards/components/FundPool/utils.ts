type ChainNativeCurrency = {
  name: string;
  symbol: string;
  decimals: number;
};

export const generateNativeToken = (nativeCurrency?: ChainNativeCurrency, chainNativeCurrencySymbol?: string) => {
  return {
    address: "native",
    name: nativeCurrency?.name ?? "",
    symbol: chainNativeCurrencySymbol ?? "",
    logoURI: chainNativeCurrencySymbol === "ETH" ? "/tokens/ether.svg" : "/confetti/loader/frame-1.svg",
    decimals: nativeCurrency?.decimals ?? 18,
  };
};
