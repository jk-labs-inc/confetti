import { animate, motion, useMotionValue } from "motion/react";
import { FC, useEffect, useRef } from "react";
import { AddFundsProviderType } from "../../providers";

interface AddFundsToggleProps {
  value: AddFundsProviderType;
  onChange: (value: AddFundsProviderType) => void;
}

const TOGGLE_OPTIONS = [
  { id: AddFundsProviderType.ONRAMP, label: "add from scratch" },
  { id: AddFundsProviderType.BRIDGE, label: "bridge funds" },
];

const AddFundsToggle: FC<AddFundsToggleProps> = ({ value, onChange }) => {
  const toggleOptions = TOGGLE_OPTIONS;

  const selectedIndex = toggleOptions.findIndex(option => option.id === value);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const indicatorX = useMotionValue(0);
  const indicatorWidth = useMotionValue(0);

  useEffect(() => {
    const activeButton = buttonRefs.current[selectedIndex];
    if (!activeButton) return;

    animate(indicatorX, activeButton.offsetLeft, {
      type: "spring",
      stiffness: 400,
      damping: 30,
    });

    animate(indicatorWidth, activeButton.offsetWidth, {
      type: "spring",
      stiffness: 400,
      damping: 30,
    });
  }, [selectedIndex, indicatorX, indicatorWidth]);

  const handleClick = (index: number) => {
    onChange(toggleOptions[index].id);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick(index);
    }
  };

  return (
    <div
      className="relative flex w-[304px] h-8 items-center rounded-full bg-transparent border border-primary-3 p-1"
      role="tablist"
    >
      <motion.div
        className="absolute left-0 top-1/2 -translate-y-1/2 h-6 rounded-full"
        style={{
          x: indicatorX,
          width: indicatorWidth,
          willChange: "transform",
          background: "var(--background-image-gradient-add-funds-toggle)",
        }}
      />
      {toggleOptions.map((option, index) => (
        <button
          key={option.id}
          ref={el => {
            buttonRefs.current[index] = el;
          }}
          onClick={() => handleClick(index)}
          onKeyDown={e => handleKeyDown(e, index)}
          className={`relative z-10 h-6 flex-1 text-base font-semibold rounded-full transition-colors duration-200 focus:outline-none cursor-pointer flex items-center justify-center ${
            selectedIndex === index ? "text-true-black" : "text-neutral-14"
          }`}
          role="tab"
          aria-selected={selectedIndex === index}
          aria-label={option.label}
          tabIndex={0}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default AddFundsToggle;
