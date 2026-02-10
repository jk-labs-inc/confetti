import React, { FC } from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import { useShallow } from "zustand/shallow";
import MotionSpinner from "@components/UI/MotionSpinner";
import { motion } from "motion/react";
import { DeploymentProcessState, TransactionState } from "@hooks/useDeployContest/types";
import { useFundPoolStore } from "@components/_pages/Create/pages/ContestRewards/components/FundPool/store";

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

type TransactionKey = "deployRewards" | "attachRewards" | `fund_${string}`;

interface Transaction {
  key: TransactionKey;
  label: string | React.ReactNode;
}

interface RewardsDeploymentStatusProps {
  deploymentProcess: DeploymentProcessState;
  addFundsToRewards: boolean;
}

const getTransactionStatus = (
  transactionKey: TransactionKey,
  deploymentProcess: DeploymentProcessState,
): TransactionState | null => {
  if (transactionKey === "deployRewards") {
    return deploymentProcess.transactions.deployRewards;
  }
  if (transactionKey === "attachRewards") {
    return deploymentProcess.transactions.attachRewards;
  }
  if (transactionKey.startsWith("fund_")) {
    return deploymentProcess.transactions.fundTokens[transactionKey] || null;
  }
  return null;
};

const renderTransactionStatus = (state: TransactionState | null) => {
  if (!state) return null;
  if (state.status === "loading") return <MotionSpinner size={24} theme="light" />;
  if (state.status === "success") return <CheckCircleIcon className="text-positive-11 w-6 h-6" />;
  if (state.status === "error") return <XCircleIcon className="text-negative-11 w-6 h-6" />;
  return null;
};

export const RewardsDeploymentStatus: FC<RewardsDeploymentStatusProps> = ({ deploymentProcess, addFundsToRewards }) => {
  const { tokenWidgets } = useFundPoolStore(useShallow(state => ({ tokenWidgets: state.tokenWidgets })));

  const baseTransactions: Transaction[] = [
    { key: "deployRewards", label: "Deploying rewards pool..." },
    { key: "attachRewards", label: "Attaching rewards pool to the contest..." },
  ];

  const tokenTransactions: Transaction[] = tokenWidgets
    .filter(token => parseFloat(token.amount) > 0)
    .map(token => ({
      key: `fund_${token.symbol}` as TransactionKey,
      label: <FundingLabel amount={token.amount} symbol={token.symbol} />,
    }));

  const transactions: Transaction[] = [...baseTransactions, ...(addFundsToRewards ? tokenTransactions : [])];

  const shouldBeActive = (index: number): boolean => {
    const prevTransaction = transactions[index - 1];
    if (!prevTransaction) return true;

    const prevState = getTransactionStatus(prevTransaction.key, deploymentProcess);
    return prevState?.status === "success";
  };

  return (
    <div className="flex flex-col gap-11 max-w-[600px]">
      <div className="flex flex-col gap-4 w-full md:w-2/3">
        {transactions.map((transaction, index) => {
          const state = getTransactionStatus(transaction.key, deploymentProcess);
          const isActive = shouldBeActive(index);

          return (
            <motion.div
              key={transaction.key}
              className="flex items-center justify-between border-b pb-2"
              initial={false}
              animate={{
                opacity: isActive ? 1 : 0.4,
                borderColor:
                  state?.status === "loading"
                    ? "#3A3E44" // border-primary-2
                    : state?.status === "success"
                    ? "#78FFC6" // border-positive-11
                    : state?.status === "error"
                    ? "#E04D65" // border-negative-11
                    : "#3A3E44", // border-primary-2
              }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
            >
              <p className="text-[16px] text-neutral-11">{transaction.label}</p>
              {renderTransactionStatus(state)}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
