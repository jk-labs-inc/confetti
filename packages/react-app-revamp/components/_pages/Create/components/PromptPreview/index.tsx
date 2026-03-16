import { Interweave } from "interweave";
import { UrlMatcher } from "interweave-autolink";
import { FC } from "react";

type Prompt = {
  content: string;
  isEmpty: boolean;
};

interface CreateFlowPromptPreviewProps {
  summarize: Prompt;
  evaluateVoters: Prompt;
  contactDetails: Prompt;
}

const CreateFlowPromptPreview: FC<CreateFlowPromptPreviewProps> = ({ summarize, evaluateVoters, contactDetails }) => {
  if (summarize.isEmpty && evaluateVoters.isEmpty && contactDetails.isEmpty) {
    return <p className="text-neutral-11 font-bold">no content!</p>;
  }

  return (
    <div className="prose prose-invert flex flex-col">
      <Interweave content={`~ ${summarize.content}`} matchers={[new UrlMatcher("url")]} />
      {!evaluateVoters.isEmpty && (
        <div className="mt-6">
          <Interweave content={`~ ${evaluateVoters.content}`} matchers={[new UrlMatcher("url")]} />
        </div>
      )}
      {!contactDetails.isEmpty && (
        <div className="mt-6">
          <Interweave content={`~ ${contactDetails.content}`} matchers={[new UrlMatcher("url")]} />
        </div>
      )}
    </div>
  );
};

export default CreateFlowPromptPreview;
