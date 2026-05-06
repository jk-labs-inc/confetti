import { useModal } from "@getpara/react-sdk-lite";
import { useWallet } from "@hooks/useWallet";
import { motion } from "motion/react";
import React, { useMemo } from "react";

export enum ButtonType {
  DEFAULT = "default",
  TX_ACTION = "txAction",
}

export enum ButtonSize {
  EXTRA_SMALL = "extraSmall",
  SMALL = "small",
  SMALL_LONG = "smallLong",
  DEFAULT = "default",
  DEFAULT_LARGE = "defaultLarge",
  DEFAULT_LONG = "defaultLong",
  LARGE = "large",
  EXTRA_LARGE = "extraLarge",
  EXTRA_LARGE_LONG = "extraLargeLong",
  EXTRA_LARGE_LONG_MOBILE = "extraLargeLongMobile",
  SUBMIT_ENTRY = "submitEntry",
  SUBMIT_ENTRY_MOBILE = "submitEntryMobile",
  SUBMIT_ENTRY_FULL = "submitEntryFull",
  FULL = "full",
}

interface ButtonProps {
  type?: ButtonType;
  colorClass?: string;
  size?: ButtonSize;
  textColorClass?: string;
  isDisabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
  id?: string;
}

const sizeClasses = {
  [ButtonSize.EXTRA_SMALL]: "w-20 h-6",
  [ButtonSize.SMALL]: "w-24 h-6",
  [ButtonSize.SMALL_LONG]: "w-36 h-6",
  [ButtonSize.DEFAULT]: "w-[120px] h-8",
  [ButtonSize.DEFAULT_LARGE]: "w-[120px] h-10",
  [ButtonSize.DEFAULT_LONG]: "w-40 h-8",
  [ButtonSize.LARGE]: "w-40 h-[40px]",
  [ButtonSize.EXTRA_LARGE]: "w-[216px] h-[40px]",
  [ButtonSize.EXTRA_LARGE_LONG]: "w-[280px] h-[48px]",
  [ButtonSize.EXTRA_LARGE_LONG_MOBILE]: "w-[320px] h-[40px]",
  [ButtonSize.SUBMIT_ENTRY]: "w-[200px] h-8",
  [ButtonSize.SUBMIT_ENTRY_MOBILE]: "w-[120px] h-8",
  [ButtonSize.SUBMIT_ENTRY_FULL]: "w-full h-8",
  [ButtonSize.FULL]: "w-full h-[40px]",
};

const Button: React.FC<ButtonProps> = ({
  type = ButtonType.DEFAULT,
  colorClass = "yellow",
  size = ButtonSize.DEFAULT,
  textColorClass = "text-true-black",
  isDisabled,
  onClick,
  children,
  id,
}) => {
  const { isConnected } = useWallet();
  const { openModal } = useModal();

  const handleOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (type === ButtonType.TX_ACTION && !isConnected) {
      openModal();
    } else {
      onClick?.(e);
    }
  };

  const disabledClasses = useMemo(() => (isDisabled ? "button-delete-state" : ""), [isDisabled]);

  return (
    <motion.button
      id={id}
      className={`text-[16px] tracking-tighter rounded-[10px] font-bold ${disabledClasses} ${textColorClass} ${colorClass} ${sizeClasses[size]} `}
      style={{ willChange: "transform" }}
      whileTap={{ scale: 0.97 }}
      onClick={handleOnClick}
      disabled={isDisabled}
    >
      {children}
    </motion.button>
  );
};

export default Button;
