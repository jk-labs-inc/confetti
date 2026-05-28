import Tabs from "@components/UI/Tabs";
import { FC, ReactNode, useEffect } from "react";

export enum Tab {
  Contest = "Contest",
  Rules = "Rules",
  Rewards = "my rewards",
}

interface ContestTabsProps {
  tab: Tab;
  excludeTabs?: Tab[];
  onChange?: (tab: Tab) => void;
  rightContent?: ReactNode;
}

const ContestTabs: FC<ContestTabsProps> = ({ tab, excludeTabs = [], onChange, rightContent }) => {
  const allTabs = Object.values(Tab);
  const tabs = allTabs.filter(t => !excludeTabs.includes(t));

  useEffect(() => {
    if (excludeTabs.includes(tab) && onChange) {
      onChange(Tab.Contest);
    }
  }, [excludeTabs, tab, onChange]);

  const handleChange = (selectedTab: string) => {
    onChange?.(selectedTab as Tab);
  };

  return <Tabs tabs={tabs} activeTab={tab} onChange={handleChange} rightContent={rightContent} />;
};

export default ContestTabs;
