import { ReactNode } from "react";

export type ContestNameActionsPlacement = "hanging" | "inline";

export interface ContestNameProps {
  contestName: string;
  canEditTitle: boolean;
  contestAuthorEthereumAddress?: string;
  contestPrompt?: string;
  contestImageUrl?: string;
  titleLeading?: ReactNode;
  actionsPlacement?: ContestNameActionsPlacement;
}
