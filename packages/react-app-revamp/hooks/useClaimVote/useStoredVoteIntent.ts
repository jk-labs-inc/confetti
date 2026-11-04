import { voteIntentStore } from "lib/claimVote/storage";
import { useSyncExternalStore } from "react";

const serverSnapshot = () => null;

export const useStoredVoteIntent = () =>
  useSyncExternalStore(voteIntentStore.subscribe, voteIntentStore.read, serverSnapshot);
