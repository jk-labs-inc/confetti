import { useFitTextToBox } from "@components/EntryCarousel/useFitTextToBox";
import CompactAmount from "@components/UI/CompactAmount";
import { CSSProperties, FC, useEffect, useId } from "react";
import { useFitTextGroup } from "./FitTextGroup";

const FitText: FC<{
  text: string;
  min: number;
  max: number;
  className?: string;
  style?: CSSProperties;
  /** Sync size with the other grouped FitTexts in the nearest FitTextGroup; use the same min/max across members. */
  group?: boolean;
  /** Compress micro amounts' leading zeros into subscript notation; display-only strings. */
  compactZeros?: boolean;
}> = ({ text, min, max, className, style, group, compactZeros }) => {
  const groupValue = useFitTextGroup();
  const cap = group ? (groupValue?.cap ?? null) : null;
  const { ref, fontSize } = useFitTextToBox<HTMLSpanElement>(text, min, max, cap);
  const id = useId();
  const report = group ? groupValue?.report : undefined;

  useEffect(() => {
    if (!report) return;
    report(id, fontSize);
    return () => report(id, null);
  }, [report, id, fontSize]);

  const applied = cap === null ? fontSize : Math.min(fontSize, cap);
  return (
    <span ref={ref} className={className} style={{ ...style, fontSize: `${applied}px` }}>
      {compactZeros ? <CompactAmount value={text} /> : text}
    </span>
  );
};

export default FitText;
