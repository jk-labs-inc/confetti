import { ChainWithIcon } from "@config/wagmi";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { FC } from "react";

interface AdvancedOptionsProps {
  isOpen: boolean;
  currentChain?: ChainWithIcon;
  availableChains?: readonly ChainWithIcon[];
  onChainSwitch?: (chainId: number) => void;
}

const AdvancedOptions: FC<AdvancedOptionsProps> = ({ isOpen, currentChain, availableChains, onChainSwitch }) => {
  if (!availableChains || !onChainSwitch) return null;

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="overflow-hidden border-b border-neutral-17"
        >
          <div className="px-4 pt-3 pb-4 flex flex-col gap-2">
            <p className="text-[12px] font-bold text-neutral-9 uppercase">network</p>
            <div className="flex flex-wrap gap-1.5 p-px">
              {availableChains.map(chain => (
                <button
                  key={chain.id}
                  onClick={() => {
                    onChainSwitch(chain.id);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-colors text-[12px] font-bold ${
                    chain.id === currentChain?.id
                      ? "bg-white/5 text-neutral-11 ring-1 ring-positive-11"
                      : "bg-white/5 text-neutral-9 hover:bg-white/10"
                  }`}
                >
                  {chain.iconUrl && (
                    <Image src={chain.iconUrl} alt={chain.name} width={14} height={14} className="rounded-full" />
                  )}
                  <span>{chain.name}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdvancedOptions;
