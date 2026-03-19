import ButtonV3, { ButtonSize, ButtonType } from "@components/UI/ButtonV3";
import { useModal } from "@getpara/react-sdk-lite";
import { motion, AnimatePresence } from "motion/react";
import { FC, useState, useMemo } from "react";

const PARTICLE_SVGS = [
  "/particles/confetti-pink.svg",
  "/particles/confetti-purple.svg",
  "/particles/confetti-cyan.svg",
  "/particles/confetti-green.svg",
  "/particles/confetti-violet.svg",
];

interface VoteButtonProps {
  isDisabled: boolean;
  isInvalidBalance: boolean;
  isConnected: boolean;
  onVote?: () => void;
  onAddFunds?: () => void;
}

enum VoteButtonType {
  INSUFFICIENT_BALANCE = "insufficientBalance",
  CONNECT_WALLET = "connectWallet",
  DEFAULT = "default",
}

const ButtonText = {
  [VoteButtonType.INSUFFICIENT_BALANCE]: "add funds to vote",
  [VoteButtonType.CONNECT_WALLET]: "connect wallet",
  [VoteButtonType.DEFAULT]: "buy votes",
};

const VoteButton: FC<VoteButtonProps> = ({ isDisabled, isInvalidBalance, isConnected, onVote, onAddFunds }) => {
  const { openModal } = useModal();
  const [isHovered, setIsHovered] = useState(false);

  const particles = useMemo(
    () =>
      [10, 50, 90].map((x, i) => ({
        x,
        svg: PARTICLE_SVGS[i % PARTICLE_SVGS.length],
        delay: i * 0.3,
        size: 7,
      })),
    [],
  );

  const getButtonText = () => {
    if (isInvalidBalance) {
      return ButtonText[VoteButtonType.INSUFFICIENT_BALANCE];
    } else if (isConnected) {
      return ButtonText[VoteButtonType.DEFAULT];
    } else {
      return ButtonText[VoteButtonType.CONNECT_WALLET];
    }
  };

  const handleClick = () => {
    if (isInvalidBalance) {
      onAddFunds?.();
    } else if (!isConnected) {
      openModal();
    } else {
      onVote?.();
    }
  };

  const showConfetti = isConnected && !isInvalidBalance && !isDisabled;

  return (
    <div className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <AnimatePresence>
        {showConfetti && isHovered &&
          particles.map((p, i) => (
            <motion.img
              key={`confetti-${i}`}
              src={p.svg}
              alt=""
              className="absolute pointer-events-none"
              style={{
                left: `${p.x}%`,
                bottom: "100%",
                width: p.size,
                height: p.size,
              }}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 0.7, 0], y: -20 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, delay: p.delay, ease: "easeOut", repeat: Infinity, repeatDelay: 0.3 }}
            />
          ))}
      </AnimatePresence>
      <ButtonV3
        type={ButtonType.TX_ACTION}
        isDisabled={isInvalidBalance || !isConnected ? false : isDisabled}
        colorClass="px-[20px] text-[24px] font-bold bg-gradient-purple rounded-[40px] w-full"
        size={ButtonSize.FULL}
        onClick={handleClick}
      >
        <span className="w-full text-center">{getButtonText()}</span>
      </ButtonV3>
    </div>
  );
};

export default VoteButton;
