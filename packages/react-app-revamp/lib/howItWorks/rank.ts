export const rankByVotes = (votes: readonly number[]): number[] =>
  votes.map((own, i) => 1 + votes.filter((other, j) => other > own || (other === own && j < i)).length);
