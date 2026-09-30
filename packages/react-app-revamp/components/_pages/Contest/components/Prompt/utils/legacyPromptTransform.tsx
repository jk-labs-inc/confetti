import { Node } from "interweave";
import { ReactNode } from "react";

export const legacyPromptTransform = (node: HTMLElement, children: Node[]): ReactNode => {
  const element = node.tagName.toLowerCase();

  if (element === "p") {
    return <p className="text-[16px]">{children}</p>;
  } else if (element === "ul") {
    return <ul className="list-disc list-inside list-explainer">{children}</ul>;
  } else if (element === "li") {
    return <li className="flex items-center">{children}</li>;
  }
};
