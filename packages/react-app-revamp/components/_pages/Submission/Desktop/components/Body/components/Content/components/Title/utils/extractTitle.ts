import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";

const IMG_TITLE_KEY = "JOKERACE_IMG_TITLE";
const TWEET_TITLE_KEY = "JOKERACE_TWEET_TITLE";

export const extractTitle = (stringArray: string[], enabledPreview: EntryPreview | null): string | null => {
  if (stringArray.length === 0) {
    return null;
  }

  if (enabledPreview === EntryPreview.IMAGE_AND_TITLE || enabledPreview === EntryPreview.TWEET_AND_TITLE) {
    const params = new URLSearchParams(stringArray[0]);
    return params.get(IMG_TITLE_KEY) || params.get(TWEET_TITLE_KEY);
  }

  return stringArray[0];
};
