import { NextResponse } from "next/server";
import { getTweet } from "react-tweet/api";
import type { Tweet } from "react-tweet/api";

type RouteSegment = { params: Promise<{ id: string }> };

export const fetchCache = "only-cache";

const normalizeEntities = (t: any) => {
  if (!t) return;

  t.entities = t.entities ?? {};
  t.entities.hashtags = t.entities.hashtags ?? [];
  t.entities.urls = t.entities.urls ?? [];
  t.entities.user_mentions = t.entities.user_mentions ?? [];
  t.entities.symbols = t.entities.symbols ?? [];
};

const normalizeTweet = (tweet: Tweet | undefined) => {
  if (!tweet) return tweet;
  normalizeEntities(tweet);
  normalizeEntities(tweet.parent);
  normalizeEntities(tweet.quoted_tweet);
  return tweet;
};

export async function GET(_req: Request, { params }: RouteSegment) {
  try {
    const resolvedParams = await params;
    const tweet = normalizeTweet(await getTweet(resolvedParams.id));
    return NextResponse.json({ data: tweet ?? null }, { status: tweet ? 200 : 404 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message ?? "Bad request." }, { status: 400 });
  }
}
