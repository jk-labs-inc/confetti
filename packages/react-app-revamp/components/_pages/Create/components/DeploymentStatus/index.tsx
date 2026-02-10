import { useFundPoolStore } from "@components/_pages/Create/pages/ContestRewards/components/FundPool/store";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import { DeploymentProcessState } from "@hooks/useDeployContest/types";
import { motion } from "motion/react";
import React, { FC } from "react";
import { useShallow } from "zustand/shallow";
import BaseTransactions from "./components/BaseTransactions";
import TransactionStatusIcons from "./components/TransactionStatusIcons";
import { getTransactionStatus } from "./helpers";
import { Transaction, TransactionKey } from "./types";

const FundingLabel: FC<{ amount: string; symbol: string }> = ({ amount, symbol }) => {
  const { displayValue, displaySymbol } = useDisplayPrice(amount, symbol);

  return (
    <>
      Funding pool with{" "}
      {displaySymbol === "$" ? (
        `$${displayValue}`
      ) : (
        <>
          {displayValue} <span className="uppercase">{displaySymbol}</span>
        </>
      )}
      ...
    </>
  );
};

interface DeploymentStatusProps {
  deploymentProcess: DeploymentProcessState;
  addFundsToRewards: boolean;
  onGoBack?: () => void;
}

export const DeploymentStatus: React.FC<DeploymentStatusProps> = ({
  deploymentProcess,
  addFundsToRewards,
  onGoBack,
}) => {
  const { tokenWidgets } = useFundPoolStore(useShallow(state => ({ tokenWidgets: state.tokenWidgets })));

  const tokenTransactions: Transaction[] = tokenWidgets
    .filter(token => parseFloat(token.amount) > 0)
    .map(token => ({
      key: `fund_${token.symbol}` as TransactionKey,
      label: <FundingLabel amount={token.amount} symbol={token.symbol} />,
    }));

  const baseTransactionCount = 3;

  const shouldBeActive = (index: number): boolean => {
    if (index === 0) return true;

    // For base transactions (0-2)
    if (index < baseTransactionCount) {
      const prevKey = index === 1 ? "deployContest" : "deployRewards";
      const prevState = getTransactionStatus(prevKey, deploymentProcess);
      return prevState?.status === "success";
    }

    // For token transactions (3+)
    if (index === baseTransactionCount) {
      const prevState = getTransactionStatus("attachRewards", deploymentProcess);
      return prevState?.status === "success";
    }

    const tokenIndex = index - baseTransactionCount;
    const prevToken = tokenTransactions[tokenIndex - 1];
    if (prevToken) {
      const prevState = getTransactionStatus(prevToken.key, deploymentProcess);
      return prevState?.status === "success";
    }

    return false;
  };

  const hasError =
    getTransactionStatus("deployContest", deploymentProcess)?.status === "error" ||
    getTransactionStatus("deployRewards", deploymentProcess)?.status === "error" ||
    getTransactionStatus("attachRewards", deploymentProcess)?.status === "error" ||
    tokenTransactions.some(tx => getTransactionStatus(tx.key, deploymentProcess)?.status === "error");

  return (
    <div className="flex flex-col gap-11 max-w-[600px]">
      <div className="flex flex-col gap-4 w-full md:w-2/3">
        <BaseTransactions deploymentProcess={deploymentProcess} shouldBeActive={shouldBeActive} />
        {addFundsToRewards &&
          tokenTransactions.map((transaction, index) => {
            const state = getTransactionStatus(transaction.key, deploymentProcess);
            const isActive = shouldBeActive(baseTransactionCount + index);

            return (
              <motion.div
                key={transaction.key}
                className="flex items-center justify-between border-b pb-2"
                initial={false}
                animate={{
                  opacity: isActive ? 1 : 0.4,
                  borderColor:
                    state?.status === "loading"
                      ? "#3A3E44"
                      : state?.status === "success"
                      ? "#78FFC6"
                      : state?.status === "error"
                      ? "#E04D65"
                      : "#3A3E44",
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut",
                }}
              >
                <p className="text-[16px] text-neutral-11">{transaction.label}</p>
                <TransactionStatusIcons state={state || { status: "pending" }} />
              </motion.div>
            );
          })}
        {hasError && onGoBack && (
          <button className="flex items-center gap-[5px] cursor-pointer group" onClick={onGoBack}>
            <div className="transition-transform duration-200 group-hover:-translate-x-1">
              <img src="/create-flow/back.svg" alt="back" width={15} height={15} className="mt-1" />
            </div>
            <p className="text-[16px]">go back to review </p>
          </button>
        )}
      </div>
    </div>
  );
};
