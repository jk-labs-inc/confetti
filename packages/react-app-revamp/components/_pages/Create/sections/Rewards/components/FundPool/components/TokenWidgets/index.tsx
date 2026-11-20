import { ChainWithIcon } from "@config/wagmi";
import { FC, useEffect } from "react";
import { useShallow } from "zustand/shallow";
import { useFundPoolStore } from "../../store";
import { createDefaultFundWidget, withFundableTokens } from "../../utils";
import TokenWidget from "./components";
import { InputMode } from "./components/useTokenWidget";

interface TokenWidgetsProps {
  chain: ChainWithIcon;
  preferredInputMode?: InputMode;
}

const TokenWidgets: FC<TokenWidgetsProps> = ({ chain, preferredInputMode }) => {
  const { tokenWidgets, setTokenWidgets } = useFundPoolStore(
    useShallow(state => ({
      tokenWidgets: state.tokenWidgets,
      setTokenWidgets: state.setTokenWidgets,
    })),
  );

  useEffect(() => {
    const fundableWidgets = withFundableTokens(chain, tokenWidgets);
    if (fundableWidgets !== tokenWidgets) setTokenWidgets(fundableWidgets);
  }, [chain, tokenWidgets, setTokenWidgets]);

  const handleAddMoreTokens = () => {
    setTokenWidgets([...tokenWidgets, createDefaultFundWidget(chain)]);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-8">
        {tokenWidgets.map((widget, index) => (
          <TokenWidget
            key={widget.id}
            tokenWidget={widget}
            index={index}
            chain={chain}
            preferredInputMode={preferredInputMode}
          />
        ))}
      </div>
      <button
        className="text-positive-11 text-[16px] self-start pl-6 hover:text-positive-9 transition-colors duration-300 ease-in-out"
        onClick={handleAddMoreTokens}
      >
        + add more tokens
      </button>
    </div>
  );
};

export default TokenWidgets;
