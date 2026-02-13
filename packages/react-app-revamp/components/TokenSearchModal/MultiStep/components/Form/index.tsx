import { FilteredToken } from "@hooks/useTokenList";
import { FC, useState } from "react";
import CreateTextInput from "components/_pages/Create/components/TextInput";
import CreateGradientTitle from "@components/_pages/Create/components/GradientTitle";
import ButtonV3, { ButtonSize } from "@components/UI/ButtonV3";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import { addressRegex } from "@helpers/regex";
import Skeleton from "react-loading-skeleton";

interface TokenSearchModalERC20MultiStepFormProps {
  token: FilteredToken;
  onBack: () => void;
  onSubmit: (recipient: string, amount: string) => void;
}

const TokenSearchModalERC20MultiStepForm: FC<TokenSearchModalERC20MultiStepFormProps> = ({
  token,
  onSubmit,
  onBack,
}) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<{ recipient?: string; amount?: string }>({});

  const balanceRaw = token.balance?.toString() ?? "0";
  const { displayValue: balanceDisplayValue, displaySymbol: balanceDisplaySymbol, isLoading: isPriceLoading } = useDisplayPrice(
    balanceRaw,
    token.symbol,
  );

  const handleSubmit = () => {
    const newErrors: { recipient?: string; amount?: string } = {};

    if (!recipient) {
      newErrors.recipient = "recipient address is required";
    } else if (!addressRegex.test(recipient)) {
      newErrors.recipient = "invalid ethereum address";
    }

    if (!amount) {
      newErrors.amount = "amount is required";
    } else {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        newErrors.amount = "amount must be a positive number";
      } else if (token.balance && amountValue > parseFloat(token.balance.toString())) {
        newErrors.amount = "amount exceeds available balance";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(recipient, amount);
    }
  };

  const handleRecipientChange = (value: string) => {
    setRecipient(value);
    if (errors.recipient) {
      if (addressRegex.test(value)) {
        setErrors(prev => ({ ...prev, recipient: undefined }));
      }
    }
  };

  const handleAmountChange = (value: string) => {
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setAmount(value);
      if (errors.amount) {
        const amountValue = parseFloat(value);
        if (
          !isNaN(amountValue) &&
          amountValue > 0 &&
          (!token.balance || amountValue <= parseFloat(token.balance.toString()))
        ) {
          setErrors(prev => ({ ...prev, amount: undefined }));
        }
      }
    }
  };

  const handleMaxAmount = () => {
    const maxAmount = token.balance ? token.balance.toString() : "0";
    setAmount(maxAmount);
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: undefined }));
    }
  };

  const isAmountExceedingBalance = () => {
    if (!amount || !token.balance) return false;
    return parseFloat(amount) > parseFloat(token.balance.toString());
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <CreateGradientTitle>recipient address</CreateGradientTitle>
          <CreateTextInput
            className="md:w-full"
            value={recipient}
            onChange={handleRecipientChange}
            placeholder="0x..."
          />
          {errors.recipient && <p className="text-[14px] font-bold text-negative-11">{errors.recipient}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <CreateGradientTitle>amount</CreateGradientTitle>
          <div className="relative">
            <CreateTextInput value={amount} onChange={handleAmountChange} placeholder="0.0" className="md:w-full" />
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <span className="text-[14px] uppercase text-neutral-9">{token.symbol}</span>
              <button
                onClick={handleMaxAmount}
                className="uppercase text-[14px] text-positive-11 hover:text-positive-9 transition-colors duration-300 ease-in-out"
                type="button"
              >
                max
              </button>
            </div>
          </div>
          {errors.amount && <p className="text-[14px] font-bold text-negative-11">{errors.amount}</p>}
          {isAmountExceedingBalance() && !errors.amount && (
            <p className="text-[14px] font-bold text-negative-11">amount exceeds available balance</p>
          )}
          <div className="flex justify-end">
            <span className="text-[14px] text-neutral-9">
              Available:{" "}
              {isPriceLoading ? (
                <Skeleton width={60} height={14} baseColor="#706f78" highlightColor="#FFE25B" inline />
              ) : balanceDisplaySymbol === "$" ? (
                `$${balanceDisplayValue}`
              ) : (
                <>
                  {balanceDisplayValue} <span className="uppercase">{balanceDisplaySymbol}</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <ButtonV3
          colorClass="bg-gradient-create"
          size={ButtonSize.FULL}
          textColorClass="text-true-black rounded-[40px]"
          onClick={handleSubmit}
        >
          send funds
        </ButtonV3>
        <div className="flex items-center gap-[5px] -ml-[15px] cursor-pointer group" onClick={onBack}>
          <div className="transition-transform duration-200 group-hover:-translate-x-1">
            <img src="/create-flow/back.svg" alt="back" width={15} height={15} className="mt-px" />
          </div>
          <p className="text-[16px]">back</p>
        </div>
      </div>
    </div>
  );
};

export default TokenSearchModalERC20MultiStepForm;
