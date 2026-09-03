interface UrlParams {
  [key: string]: string;
}

//TODO: update all of these to the actual links
const BASE_JOKERACE_URL = "https://confetti.win/contest/";
const BASE_TWITTER_URL = "https://twitter.com/intent/tweet?";

const buildUrl = (baseUrl: string, params: UrlParams): string => {
  const query = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return `${baseUrl}${query}`;
};

const contestShareText = (contestName: string) => {
  return `Come play ${contestName} on @confetti_win with me!\n`;
};

const votedEntryShareText = (entryTitle?: string, contestName?: string) => {
  const entry = entryTitle ? `"${entryTitle}"` : "an entry";
  const contest = contestName ? ` in ${contestName}` : "";
  return `i just voted for ${entry}${contest} on @confetti_win. vote for it too 👇\n`;
};

export const generateTwitterShareUrlForContest = (contestName: string, contestAddress: string, chain: string) => {
  const params = {
    text: contestShareText(contestName),
    url: `${BASE_JOKERACE_URL}${chain}/${contestAddress}`,
  };
  return buildUrl(BASE_TWITTER_URL, params);
};

interface VotedEntryShareParams {
  entryTitle?: string;
  contestName?: string;
  contestAddress?: string;
  chainName?: string;
}

export const generateTwitterShareUrlForVotedEntry = ({
  entryTitle,
  contestName,
  contestAddress,
  chainName,
}: VotedEntryShareParams) => {
  const url =
    contestAddress && chainName
      ? `${BASE_JOKERACE_URL}${chainName}/${contestAddress}`
      : typeof window !== "undefined"
        ? window.location.href
        : "";
  const params = {
    text: votedEntryShareText(entryTitle, contestName),
    url,
  };
  return buildUrl(BASE_TWITTER_URL, params);
};

export const generateUrlToCopy = async (contestAddress: string, chain: string) => {
  const url = `${BASE_JOKERACE_URL}${chain}/${contestAddress}`;
  await navigator.clipboard.writeText(url);
};

export const generateUrlContest = (contestAddress: string, chain: string) => {
  const url = `${BASE_JOKERACE_URL}${chain}/${contestAddress}`;
  return url;
};
