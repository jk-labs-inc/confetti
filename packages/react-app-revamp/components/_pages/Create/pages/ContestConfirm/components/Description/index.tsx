import ContestImage from "@components/_pages/Contest/components/ContestImage";
import CreateTextContainer from "@components/_pages/Create/components/TextContainer";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { Interweave } from "interweave";
import { UrlMatcher } from "interweave-autolink";
import { FC, useState } from "react";
import { useMediaQuery } from "react-responsive";
import CreateContestConfirmLayout from "../Layout";
import { Prompt } from "@hooks/useDeployContest/slices/contestInfoSlice";

interface CreateContestConfirmDescriptionProps {
  prompt: Prompt;
  step: number;
  imageUrl?: string;
  onClick?: (stepIndex: number) => void;
}

const CreateContestConfirmDescription: FC<CreateContestConfirmDescriptionProps> = ({
  prompt,
  step,
  imageUrl,
  onClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const fullText = [prompt.summarize, prompt.evaluateVoters, prompt.contactDetails].filter(Boolean).join("\n\n");
  const characterLimit = 250;
  const shouldShowReadMore = fullText.length > characterLimit;
  const displayText = !isExpanded && shouldShowReadMore ? fullText.slice(0, characterLimit) + "..." : fullText;

  const renderSection = (content: string, isFirst: boolean) => {
    if (!content) return null;

    return (
      <div className={isFirst ? "" : "mt-6"}>
        <Interweave content={`~ ${content}`} matchers={[new UrlMatcher("url")]} />
      </div>
    );
  };

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <CreateContestConfirmLayout onClick={() => onClick?.(step)}>
      <div className="flex flex-col gap-2 w-80 xs:w-[460px] sm:w-[560px]">
        <div className="text-[12px] uppercase font-bold text-neutral-9">Description</div>
        <div className="flex flex-col gap-4">
          {imageUrl ? <ContestImage imageUrl={imageUrl} /> : null}
          <CreateTextContainer className="md:w-[504px] ml-0 md:-ml-4">
            <div className="flex flex-col gap-2">
              <div className="prose prose-invert flex flex-col text-neutral-11 transition-color duration-300">
                {isExpanded ? (
                  <>
                    {renderSection(prompt.summarize, true)}
                    {renderSection(prompt.evaluateVoters, false)}
                    {renderSection(prompt.contactDetails || "", false)}
                  </>
                ) : (
                  <Interweave content={displayText} matchers={[new UrlMatcher("url")]} />
                )}
              </div>
              {shouldShowReadMore && (
                <button
                  onClick={handleToggleExpanded}
                  className="text-[12px] md:text-[16px] font-bold flex items-center justify-start gap-1 text-positive-11 hover:text-positive-10 transition-all duration-300 ease-in-out"
                >
                  <span>{isExpanded ? "show less" : "show more"}</span>
                  {isExpanded ? (
                    <ChevronUpIcon
                      width={isMobile ? 16 : 21}
                      height={isMobile ? 16 : 21}
                      className="md:mt-1 transition-transform duration-300"
                    />
                  ) : (
                    <ChevronDownIcon
                      width={isMobile ? 16 : 21}
                      height={isMobile ? 16 : 21}
                      className="md:mt-1 transition-transform duration-300"
                    />
                  )}
                </button>
              )}
            </div>
          </CreateTextContainer>
        </div>
      </div>
    </CreateContestConfirmLayout>
  );
};

export default CreateContestConfirmDescription;
