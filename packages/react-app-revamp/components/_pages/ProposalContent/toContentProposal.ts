import type { Proposal } from "@components/_pages/ProposalContent";
import type { ProposalCore } from "@hooks/useProposal/store";

export const toContentProposal = (p: ProposalCore): Proposal => ({
  id: p.id,
  authorEthereumAddress: p.author,
  content: p.description,
  exists: p.exists,
  isContentImage: p.isContentImage,
  tweet: p.tweet,
  votes: p.netVotes,
  rank: p.rank,
  isTied: p.isTied,
  metadataFields: (p as any).metadataFields ?? p.fieldsMetadata ?? { addressArray: [], stringArray: [], uintArray: [] },
});
