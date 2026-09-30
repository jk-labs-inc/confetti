import { legacyPromptTransform } from "@components/_pages/Contest/components/Prompt/utils/legacyPromptTransform";
import { Interweave } from "interweave";
import { UrlMatcher } from "interweave-autolink";
import { FC } from "react";

interface ContestPromptPageLegacyLayoutProps {
  prompt: string;
}

const ContestPromptPageLegacyLayout: FC<ContestPromptPageLegacyLayoutProps> = ({ prompt }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <p className="text-[24px] text-neutral-11 font-bold">contest prompt</p>
      </div>
      <div className="pl-5">
        <div className="border-l border-true-white">
          <div className="prose prose-invert pl-5 overflow-hidden">
            <Interweave content={prompt} matchers={[new UrlMatcher("url")]} transform={legacyPromptTransform} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestPromptPageLegacyLayout;
