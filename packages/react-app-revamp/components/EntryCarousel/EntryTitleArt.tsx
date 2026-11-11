import { FC } from "react";
import { useFitTextToBox } from "./useFitTextToBox";

const TITLE_MIN_FONT_PX = 16;

const titleMaxFontPx = (title: string) => Math.round(Math.max(24, Math.min(40, 40 - (title.trim().length - 12) * 0.9)));

interface EntryTitleArtProps {
  title: string;
}

const EntryTitleArt: FC<EntryTitleArtProps> = ({ title }) => {
  const { ref, fontSize } = useFitTextToBox<HTMLDivElement>(title, TITLE_MIN_FONT_PX, titleMaxFontPx(title));

  return (
    <div
      ref={ref}
      className="absolute inset-0 flex items-center justify-center overflow-hidden px-6 pb-4 pt-8 [contain:layout]"
      style={{ fontSize: `${fontSize}px` }}
    >
      <p
        className="font-sabo-filled text-balance text-center leading-[1.08] text-neutral-11 wrap-anywhere"
        style={{ textShadow: "0 1px 14px rgba(0,0,0,0.5)" }}
      >
        {title}
      </p>
    </div>
  );
};

export default EntryTitleArt;
