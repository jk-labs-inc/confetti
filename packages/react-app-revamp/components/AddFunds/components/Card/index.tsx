import { ChevronUpIcon, ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { FC, ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useShallow } from "zustand/shallow";
import { useAddFundsStore } from "../../store";

export interface AddFundsCardProps {
  name: string;
  description?: string;
  logo: string;
  logoBorderColor?: string;
  disabled?: boolean;
  disabledMessage?: string;
  expanded?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}

const AddFundsCard: FC<AddFundsCardProps> = ({
  name,
  description,
  logo,
  logoBorderColor,
  disabled = false,
  disabledMessage = "",
  expanded = false,
  onClick,
  children,
}) => {
  const { isExpanded, toggleCard, setCardExpanded } = useAddFundsStore(
    useShallow(state => ({
      isExpanded: state.isCardExpanded(name),
      toggleCard: state.toggleCard,
      setCardExpanded: state.setCardExpanded,
    })),
  );

  useEffect(() => {
    if (expanded) {
      setCardExpanded(name, true);
    }
  }, [expanded, name, setCardExpanded]);

  const handleClick = () => {
    if (disabled) return;

    if (onClick) {
      onClick();
      return;
    }

    toggleCard(name);
  };

  const renderIcon = () => {
    if (disabled) return null;

    if (onClick) {
      return (
        <ChevronRightIcon className="w-6 h-6 @max-[320px]:size-5 shrink-0 text-neutral-9 transition-colors duration-300 ease-in-out group-hover:text-neutral-11" />
      );
    }

    return isExpanded ? (
      <ChevronUpIcon className="w-6 h-6 @max-[320px]:size-5 shrink-0 text-neutral-9 transition-colors duration-300 ease-in-out" />
    ) : (
      <ChevronDownIcon className="w-6 h-6 @max-[320px]:size-5 shrink-0 text-neutral-9 transition-colors duration-300 ease-in-out group-hover:text-neutral-11" />
    );
  };

  return (
    <div
      className={`${isExpanded && children ? "shadow-entry-card rounded-2xl" : ""} ${
        isExpanded && children ? "border border-transparent" : ""
      }`}
    >
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`group flex w-full p-4 @max-[320px]:p-3 ${isExpanded ? "rounded-t-2xl" : "rounded-2xl"} border border-transparent ${
          !isExpanded && !disabled ? "hover:border-neutral-9" : ""
        } transition-colors duration-300 ease-in-out ${disabled ? "cursor-not-allowed" : "cursor-pointer"} ${
          !isExpanded || !children ? "shadow-entry-card" : ""
        }`}
      >
        <div className="flex gap-4 @max-[320px]:gap-3 items-center w-full">
          <img
            src={logo}
            alt={name}
            className={`w-10 h-10 @max-[320px]:size-8 shrink-0 p-0.5 ${disabled ? "opacity-50" : ""}`}
            style={logoBorderColor ? { borderRadius: "50%", border: `2px solid ${logoBorderColor}` } : undefined}
          />
          <div className="flex min-w-0 flex-col items-start text-left">
            <p
              className={`font-bold text-2xl @max-[320px]:text-base ${disabled ? "text-neutral-9" : "text-neutral-11"}`}
            >
              {name}
            </p>
            {disabled && disabledMessage ? (
              <div className="py-1 px-2 bg-neutral-3 rounded-lg inline-block">
                <p className="text-negative-11 font-bold text-[12px] @max-[320px]:text-[11px]">{disabledMessage}</p>
              </div>
            ) : description ? (
              <p className="text-neutral-9 font-bold normal-case text-base @max-[320px]:text-xs">{description}</p>
            ) : null}
          </div>
          <div className="ml-auto">{renderIcon()}</div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-l border-r border-b border-transparent rounded-b-2xl w-full max-w-full"
          >
            <div className="w-full max-w-full overflow-x-hidden">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddFundsCard;
