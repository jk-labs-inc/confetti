import { CreateRewardsPoolDropdownOptions } from "./components/CreatePool/components/Dropdown";

export const generateRankOptions = (limit: number): CreateRewardsPoolDropdownOptions[] => {
  return Array.from({ length: limit }, (_, i) => {
    const rank = i + 1;
    return {
      value: rank.toString(),
      label: rank.toString(),
    };
  });
};
