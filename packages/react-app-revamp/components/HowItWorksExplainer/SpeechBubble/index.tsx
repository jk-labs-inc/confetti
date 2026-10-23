import { Typewriter } from "motion-plus/react";
import { FC } from "react";

const HIDDEN_CURSOR_STYLE = { display: "none" } as const;

interface SpeechBubbleProps {
  line: string;
  isTyping: boolean;
}

const SpeechBubble: FC<SpeechBubbleProps> = ({ line, isTyping }) => (
  <div className="relative min-w-0 flex-1 rounded-[16px] border border-white/10 bg-neutral-2 px-3 py-2">
    <span className="absolute -left-[7px] top-1/2 size-3 -translate-y-1/2 rotate-45 border-b border-l border-white/10 bg-neutral-2" />
    <p className="relative grid text-[14px] font-bold leading-snug text-neutral-11">
      <span className="invisible col-start-1 row-start-1">{line}</span>
      {isTyping ? (
        <Typewriter as="span" speed="fast" className="col-start-1 row-start-1" cursorStyle={HIDDEN_CURSOR_STYLE}>
          {line}
        </Typewriter>
      ) : (
        <span className="col-start-1 row-start-1">{line}</span>
      )}
    </p>
  </div>
);

export default SpeechBubble;
