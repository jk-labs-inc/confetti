export type ParsedEntry =
  | { kind: "title"; title: string }
  | { kind: "image"; imageUrl: string; title: string }
  | { kind: "tweet"; tweetId: string; title: string };
