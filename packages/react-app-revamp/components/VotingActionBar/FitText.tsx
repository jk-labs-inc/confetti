import { useFitTextToBox } from "@components/EntryCarousel/useFitTextToBox";
import { CSSProperties, FC } from "react";

const FitText: FC<{ text: string; min: number; max: number; className?: string; style?: CSSProperties }> = ({
  text,
  min,
  max,
  className,
  style,
}) => {
  const { ref, fontSize } = useFitTextToBox<HTMLSpanElement>(text, min, max);
  return (
    <span ref={ref} className={className} style={{ ...style, fontSize: `${fontSize}px` }}>
      {text}
    </span>
  );
};

export default FitText;
