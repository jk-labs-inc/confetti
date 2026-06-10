import { compareVersions } from "compare-versions";

export const safeCompareVersions = (a: string, b: string): number | null => {
  try {
    return compareVersions(a, b);
  } catch {
    return null;
  }
};
