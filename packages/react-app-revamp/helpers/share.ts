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

export const generateTwitterShareUrlForContest = (contestName: string, contestAddress: string, chain: string) => {
  const params = {
    text: contestShareText(contestName),
    url: `${BASE_JOKERACE_URL}${chain}/${contestAddress}`,
  };
  return buildUrl(BASE_TWITTER_URL, params);
};

export const generateTwitterShareUrlForSubmission = (
  contestAddress: string,
  chain: string,
  submissionId: string,
  entryTitle?: string | null,
  contestName?: string | null,
) => {
  const text =
    entryTitle && contestName
      ? `just bought votes for ${entryTitle} in the ${contestName} contest on @confetti_win. if you buy votes on it and it wins, we both can earn 🤞\n`
      : contestName
        ? `just bought votes for an entry in the ${contestName} contest on @confetti_win. if you buy votes on it and it wins, we both can earn 🤞\n`
        : undefined;

  const params: UrlParams = {
    url: `${BASE_JOKERACE_URL}${chain}/${contestAddress}/submission/${submissionId}`,
  };

  if (text) {
    params.text = text;
  }

  return buildUrl(BASE_TWITTER_URL, params);
};

export const generateUrlToCopy = async (contestAddress: string, chain: string) => {
  const url = `${BASE_JOKERACE_URL}${chain}/${contestAddress}`;
  await navigator.clipboard.writeText(url);
};

export const generateUrlSubmissions = (contestAddress: string, chain: string, proposalId: string) => {
  const url = `${BASE_JOKERACE_URL}${chain}/${contestAddress}/submission/${proposalId}`;
  return url;
};
export const generateUrlContest = (contestAddress: string, chain: string) => {
  const url = `${BASE_JOKERACE_URL}${chain}/${contestAddress}`;
  return url;
};
