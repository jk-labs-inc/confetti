interface UrlParams {
  [key: string]: string;
}

//TODO: update all of these to the actual links
const BASE_LENSTER_URL = "https://hey.xyz/?";
const BASE_JOKERACE_URL = "https://confetti.win/contest/";
const BASE_TWITTER_URL = "https://twitter.com/intent/tweet?";
const BASE_LINKEDIN_URL = "https://www.linkedin.com/sharing/share-offsite/?";
const BASE_FACEBOOK_URL = "https://www.facebook.com/sharer/sharer.php?";
const BASE_FARCASTER_URL = "https://warpcast.com/~/compose?";
//TODO: update this to the actual channel name if we use farcaster
const FARCASTER_CHANNEL_NAME = "jokerace";
const FARCASTER_CHANNEL_KEY = "jokerace";

const buildUrl = (baseUrl: string, params: UrlParams): string => {
  const query = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return `${baseUrl}${query}`;
};

const contestShareText = (contestName: string) => {
  return `Come play ${contestName} on @jokerace_io with me!\n`;
};

const farcasterContestShareText = (contestName: string) => {
  return `Come play ${contestName} on /${FARCASTER_CHANNEL_NAME} with me!\n`;
};

export const generateLensShareUrlForContest = (contestName: string, contestAddress: string, chain: string) => {
  const params = {
    text: contestShareText(contestName),
    url: `${BASE_JOKERACE_URL}${chain}/${contestAddress}`,
  };
  return buildUrl(BASE_LENSTER_URL, params);
};

export const generateTwitterShareUrlForContest = (contestName: string, contestAddress: string, chain: string) => {
  const params = {
    text: contestShareText(contestName),
    url: `${BASE_JOKERACE_URL}${chain}/${contestAddress}`,
  };
  return buildUrl(BASE_TWITTER_URL, params);
};

export const generateFarcasterShareUrlForContest = (contestName: string, contestAddress: string, chain: string) => {
  const params = {
    text: farcasterContestShareText(contestName),
    "embeds[]": `${BASE_JOKERACE_URL}${chain}/${contestAddress}`,
    channelKey: FARCASTER_CHANNEL_KEY,
  };
  return buildUrl(BASE_FARCASTER_URL, params);
};

export const generateFarcasterShareUrlForSubmission = (
  contestName: string,
  contestAddress: string,
  chain: string,
  submissionId: string,
) => {
  const params = {
    text: `Check out my submission for ${contestName} on ${FARCASTER_CHANNEL_NAME}!`,
    "embeds[]": `${BASE_JOKERACE_URL}${chain}/${contestAddress}/submission/${submissionId}`,
    channelKey: FARCASTER_CHANNEL_KEY,
  };
  return buildUrl(BASE_FARCASTER_URL, params);
};

export const generateLensShareUrlForSubmission = (contestAddress: string, chain: string, submissionId: string) => {
  const params = {
    url: `${BASE_JOKERACE_URL}${chain}/${contestAddress}/submission/${submissionId}`,
  };
  return buildUrl(BASE_LENSTER_URL, params);
};

export const generateTwitterShareUrlForSubmission = (contestAddress: string, chain: string, submissionId: string) => {
  const params = {
    url: `${BASE_JOKERACE_URL}${chain}/${contestAddress}/submission/${submissionId}`,
    via: "jokerace_io",
  };
  return buildUrl(BASE_TWITTER_URL, params);
};

export const generateLinkedInShareUrlForSubmission = (contestAddress: string, chain: string, submissionId: string) => {
  const params = {
    url: `${BASE_JOKERACE_URL}${chain}/${contestAddress}/submission/${submissionId}`,
  };
  return buildUrl(BASE_LINKEDIN_URL, params);
};

export const generateFacebookShareUrlForSubmission = (contestAddress: string, chain: string, submissionId: string) => {
  const params = {
    u: `${BASE_JOKERACE_URL}${chain}/${contestAddress}/submission/${submissionId}`,
  };
  return buildUrl(BASE_FACEBOOK_URL, params);
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
