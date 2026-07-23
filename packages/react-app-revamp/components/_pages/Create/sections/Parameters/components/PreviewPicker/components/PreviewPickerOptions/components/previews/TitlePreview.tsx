import { formatNumberWithCommas } from "@helpers/formatNumber";

const ENTRIES: { title: string; votes: number }[] = [
  { title: "Kendrick", votes: 22450 },
  { title: "Cardi B", votes: 21157 },
  { title: "Kanye West", votes: 19486 },
  { title: "Drake", votes: 52 },
];

const TitlePreview = () => {
  return (
    <div className="flex flex-col w-full">
      <div className="grid grid-cols-[1fr_auto] items-center gap-2 md:gap-4 pb-1.5 md:pb-2 border-b border-neutral-4">
        <p className="text-[12px] md:text-[14px] text-neutral-9 font-bold normal-case">entry</p>
        <p className="text-[12px] md:text-[14px] text-neutral-9 font-bold normal-case">votes</p>
      </div>
      {ENTRIES.map(entry => (
        <div
          key={entry.title}
          className="grid grid-cols-[1fr_auto] items-center gap-2 md:gap-4 py-1 md:py-2 border-b border-neutral-4"
        >
          <p className="text-[12px] md:text-[14px] text-neutral-9 normal-case truncate">{entry.title}</p>
          <p className="text-[12px] md:text-[14px] text-neutral-9 tabular-nums">
            {formatNumberWithCommas(entry.votes)}
          </p>
        </div>
      ))}
    </div>
  );
};

export default TitlePreview;
