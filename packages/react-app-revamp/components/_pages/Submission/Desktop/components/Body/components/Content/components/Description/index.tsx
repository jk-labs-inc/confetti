import { Interweave } from "interweave";
import { UrlMatcher } from "interweave-autolink";
import { FC, useRef } from "react";
import { useSanitizedContent } from "./hooks/useSanitizedContent";
import { transform } from "./helpers/transform";
import useScrollFade from "@hooks/useScrollFade";

interface SubmissionPageDesktopBodyContentDescriptionProps {
  description: string;
}

const SubmissionPageDesktopBodyContentDescription: FC<SubmissionPageDesktopBodyContentDescriptionProps> = ({
  description,
}) => {
  const sanitizedContent = useSanitizedContent(description);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { shouldApplyFade, maskImageStyle } = useScrollFade(scrollRef, 3, [sanitizedContent]);

  return (
    <div className="relative h-full">
      <div
        ref={scrollRef}
        className="pl-6 py-4 pr-4 overflow-y-auto h-full"
        style={
          shouldApplyFade
            ? {
                maskImage: maskImageStyle,
                WebkitMaskImage: maskImageStyle,
              }
            : undefined
        }
      >
        <Interweave
          className={`prose prose-invert overflow-hidden`}
          content={sanitizedContent}
          matchers={[new UrlMatcher("url")]}
          transform={transform}
        />
      </div>
    </div>
  );
};

export default SubmissionPageDesktopBodyContentDescription;
