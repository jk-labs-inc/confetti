export interface VotePresets {
  showPushToFirst: boolean;
  showPercentPresets: boolean;
  onPushToFirst: () => void;
  onPreset: (percent: number) => void;
}
