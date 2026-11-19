import { ReactNode } from "react";

export interface ContestNameProps {
  contestName: string;
  canEditTitle: boolean;
  contestAuthorEthereumAddress?: string;
  contestPrompt?: string;
  contestImageUrl?: string;
  titleTrailing?: ReactNode;
  metaActions?: ReactNode;
}
