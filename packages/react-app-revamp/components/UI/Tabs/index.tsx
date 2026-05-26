import { animate, motion, useMotionValue } from "motion/react";
import { FC, ReactNode, useEffect, useRef, useState } from "react";

interface TabsProps {
  tabs: string[];
  activeTab: string;
  onChange?: (tab: string) => void;
  optionalInfo?: Record<string, number>;
  rightContent?: ReactNode;
}

const Tabs: FC<TabsProps> = ({ tabs, activeTab, onChange, optionalInfo, rightContent }) => {
  const [currentTab, setCurrentTab] = useState<string>(activeTab);
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
  const indicatorX = useMotionValue(0);
  const indicatorWidth = useMotionValue(0);

  const activeColor = "#E5E5E5";
  const inactiveColor = "#6A6A6A";

  useEffect(() => {
    const activeTabIndex = tabs.findIndex(tab => tab === currentTab);
    const activeTabRef = tabRefs.current[activeTabIndex];

    if (activeTabRef) {
      animate(indicatorX, activeTabRef.offsetLeft, {
        type: "spring",
        stiffness: 400,
        damping: 35,
        mass: 1.2,
      });

      animate(indicatorWidth, activeTabRef.offsetWidth, {
        type: "spring",
        stiffness: 400,
        damping: 35,
        mass: 1.2,
      });
    }
  }, [currentTab, tabs, indicatorX, indicatorWidth]);

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    onChange?.(tab);
  };

  const handleKeyDown = (e: React.KeyboardEvent, tab: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleTabChange(tab);
    }
  };

  return (
    <div className="relative flex flex-col gap-2">
      <div className="flex items-center gap-6 md:gap-8 mb-4" role="tablist">
        {tabs.map((tab, index) => (
          <motion.div
            key={tab}
            ref={(el: HTMLDivElement | null) => {
              tabRefs.current[index] = el;
            }}
            className="text-[16px] md:text-[24px] cursor-pointer relative"
            style={{ willChange: "transform" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleTabChange(tab)}
            onKeyDown={e => handleKeyDown(e, tab)}
            role="tab"
            aria-selected={tab === currentTab}
            tabIndex={0}
          >
            <motion.span
              initial={false}
              animate={{
                color: tab === currentTab ? activeColor : inactiveColor,
                fontWeight: tab === currentTab ? 600 : 400,
              }}
              transition={{
                duration: 0.2,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              style={{
                display: "block",
                willChange: "color, opacity",
              }}
            >
              {tab}
              {optionalInfo?.[tab] !== undefined && (
                <motion.span
                  className="text-[16px] ml-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  ({optionalInfo[tab]})
                </motion.span>
              )}
            </motion.span>
          </motion.div>
        ))}
        {rightContent && <div className="ml-auto flex items-center gap-3">{rightContent}</div>}
      </div>
      <div className="absolute left-0 w-full h-px bottom-0 bg-neutral-0" />
      <motion.div
        className="absolute bottom-0 h-px bg-positive-11"
        style={{
          x: indicatorX,
          width: indicatorWidth,
          willChange: "transform",
        }}
      />
    </div>
  );
};

export default Tabs;
