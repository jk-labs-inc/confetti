import ContestPromptBody from "@components/_pages/Contest/components/Prompt/components/Body";
import EditContestPrompt from "@components/_pages/Contest/components/Prompt/components/Page/components/Layout/V3/components/EditContestPrompt";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useContestStore } from "@hooks/useContest/store";
import { FC, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/shallow";

const PREVIEW_MAX_HEIGHT_PX = 84;
const PREVIEW_FADE_CLASS_NAME = "[mask-image:linear-gradient(to_bottom,black_55%,transparent)]";

const PreVoteDescription: FC = () => {
  const { contestPrompt, canEditTitleAndDescription } = useContestStore(
    useShallow(state => ({
      contestPrompt: state.contestPrompt,
      canEditTitleAndDescription: state.canEditTitleAndDescription,
    })),
  );
  const bodyRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLongerThanPreview, setIsLongerThanPreview] = useState(false);
  const isPreview = isLongerThanPreview && !isExpanded;

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;

    const measure = () => setIsLongerThanPreview(body.offsetHeight > PREVIEW_MAX_HEIGHT_PX);
    const observer = new ResizeObserver(measure);
    observer.observe(body);
    measure();

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`overflow-hidden ${isPreview ? PREVIEW_FADE_CLASS_NAME : ""}`}
        style={isPreview ? { maxHeight: PREVIEW_MAX_HEIGHT_PX } : undefined}
      >
        <div ref={bodyRef}>
          <ContestPromptBody prompt={contestPrompt} />
        </div>
      </div>
      <div className="flex items-center gap-3 empty:hidden">
        {isLongerThanPreview && (
          <button
            type="button"
            onClick={() => setIsExpanded(prev => !prev)}
            aria-expanded={isExpanded}
            className="flex items-center gap-1 text-[14px] font-bold normal-case text-neutral-11"
          >
            {isExpanded ? "less" : "more"}
            <ChevronDownIcon
              aria-hidden="true"
              strokeWidth={2.5}
              className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>
        )}
        <EditContestPrompt canEditPrompt={canEditTitleAndDescription} prompt={contestPrompt} />
      </div>
    </div>
  );
};

export default PreVoteDescription;
