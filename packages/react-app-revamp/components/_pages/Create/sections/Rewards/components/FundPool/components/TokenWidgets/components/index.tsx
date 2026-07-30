import TokenSearchModal from "@components/TokenSearchModal";
import { ChainWithIcon } from "@config/wagmi";
import { useWallet } from "@hooks/useWallet";
import { FC } from "react";
import { FundPoolToken } from "../../../store";
import BalanceDisplay from "./BalanceDisplay";
import ConnectRow from "./ConnectRow";
import TokenAmountInput from "./TokenAmountInput";
import TokenSelector from "./TokenSelector";
import WidgetHeader from "./WidgetHeader";
import { InputMode, useTokenWidget } from "./useTokenWidget";

interface TokenWidgetProps {
  tokenWidget: FundPoolToken;
  index: number;
  chain: ChainWithIcon;
  preferredInputMode?: InputMode;
}

const TokenWidget: FC<TokenWidgetProps> = ({ tokenWidget, index, chain, preferredInputMode }) => {
  const { input, token, balance, modal, handlers } = useTokenWidget({ tokenWidget, chain, preferredInputMode });
  const { isConnected } = useWallet();

  const isEtherChainNativeCurrency = token.chainNativeCurrencySymbol === "ETH";

  return (
    <>
      <div className="flex flex-col gap-4 md:w-[400px] relative">
        <div className="bg-true-black rounded-[32px] flex flex-col items-center justify-center shadow-file-upload animate-appear">
          <div className="p-6">
            <div className="w-80 md:w-[360px] rounded-[16px] bg-neutral-2 pr-4 pl-6 pt-2 pb-4">
              <div className="flex flex-col gap-2">
                <WidgetHeader
                  index={index}
                  chainLogo={chain?.iconUrl?.toString() ?? ""}
                  onRemove={handlers.onRemoveWidget}
                />

                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <TokenAmountInput
                      inputValue={input.value}
                      inputMode={input.mode}
                      isMaxPressed={input.isMaxPressed}
                      isExceedingBalance={input.isExceedingBalance}
                      secondaryDisplay={input.secondaryDisplay}
                      hasRate={input.hasRate}
                      onChange={handlers.onAmountChange}
                      onToggleMode={handlers.onToggleMode}
                    />
                    <TokenSelector
                      localSelectedToken={token.selected}
                      chainNativeCurrencySymbol={token.chainNativeCurrencySymbol ?? ""}
                      isEtherChainNativeCurrency={isEtherChainNativeCurrency}
                      onOpen={handlers.onOpenModal}
                    />
                  </div>
                  {isConnected ? (
                    <BalanceDisplay
                      balanceDisplay={balance.display}
                      balanceSymbol={balance.symbol}
                      balanceValue={balance.data?.value ?? ""}
                      onMax={handlers.onMaxBalance}
                      onRefresh={handlers.onRefreshBalance}
                    />
                  ) : (
                    <ConnectRow />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TokenSearchModal
        chains={[{ label: chain?.name ?? "", value: chain?.name ?? "" }]}
        isOpen={modal.isOpen}
        onClose={handlers.onCloseModal}
        onSelectToken={handlers.onSelectToken}
        hideChains
      />
    </>
  );
};

export default TokenWidget;
