import { ChevronUpIcon, ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { FC, ReactNode, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

type AddFundsCardVariant = "expandable" | "modal";

interface AddFundsCardProps {
  name: string;
  description: string;
  logo: string;
  descriptionClassName?: string;
  disabled?: boolean;
  disabledMessage?: string;
  expanded?: boolean;
  variant?: AddFundsCardVariant;
  children?: ReactNode;
  onClick?: () => void;
}

const AddFundsCard: FC<AddFundsCardProps> = ({
  name,
  description,
  logo,
  descriptionClassName = "",
  disabled = false,
  disabledMessage = "",
  expanded = false,
  variant = "expandable",
  onClick,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const isModalVariant = variant === "modal";

  const handleClick = () => {
    if (disabled) return;

    if (isModalVariant) {
      onClick?.();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const renderIcon = () => {
    if (disabled) return null;

    if (isModalVariant) {
      return (
        <ChevronRightIcon
          className={`w-6 h-6 text-neutral-9 transition-colors duration-300 ease-in-out group-hover:text-neutral-11`}
        />
      );
    }

    return isExpanded ? (
      <ChevronUpIcon className="w-6 h-6 text-neutral-9 transition-colors duration-300 ease-in-out" />
    ) : (
      <ChevronDownIcon
        className={`w-6 h-6 text-neutral-9 transition-colors duration-300 ease-in-out group-hover:text-neutral-11`}
      />
    );
  };

  return (
    <div className="relative">
      <div
        className={`${disabled ? "filter blur-[1px] opacity-50" : ""} ${
          isExpanded && children && !isModalVariant ? "shadow-entry-card rounded-2xl" : ""
        } ${isExpanded && children && !isModalVariant ? "border border-transparent" : ""}`}
      >
        <button
          onClick={handleClick}
          disabled={disabled}
          className={`group flex w-full p-4 ${
            isExpanded && !isModalVariant ? "rounded-t-2xl" : "rounded-2xl"
          } border border-transparent ${
            (!isExpanded || isModalVariant) && !disabled ? "hover:border-neutral-9" : ""
          } transition-colors duration-300 ease-in-out ${disabled ? "cursor-not-allowed" : "cursor-pointer"} ${
            !isExpanded || !children || isModalVariant ? "shadow-entry-card" : ""
          }`}
        >
          <div className="flex gap-4 items-center w-full">
            <img src={logo} alt={name} className="w-10 h-10" />
            <div className="flex flex-col items-start">
              <p className="text-neutral-11 font-bold text-[24px]">{name}</p>
              <p className={`text-neutral-9 font-bold normal-case ${descriptionClassName || "text-[12px]"}`}>
                {description}
              </p>
            </div>
            <div className="ml-auto">{renderIcon()}</div>
          </div>
        </button>

        {!isModalVariant && (
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
        )}
      </div>

      {disabled && disabledMessage && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="flex items-start h-full px-4 pt-4">
            <div className="w-10 shrink-0"></div>
            <div className="ml-4">
              <div className="h-[36px]"></div>
              <div className="py-1 px-2 bg-neutral-3 rounded-lg inline-block">
                <p className="text-negative-11 font-bold text-[12px]">{disabledMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddFundsCard;
