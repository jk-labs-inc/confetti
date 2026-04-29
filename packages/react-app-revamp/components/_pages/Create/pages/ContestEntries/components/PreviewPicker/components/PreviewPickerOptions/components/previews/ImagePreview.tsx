import { formatNumberWithCommas } from "@helpers/formatNumber";

const VOTES = 1248;

const ImagePreview = () => {
  return (
    <div className="flex flex-col gap-2 p-2 bg-true-black rounded-2xl shadow-entry-card w-full h-full max-w-[372px] border border-transparent">
      <div className="rounded-2xl overflow-hidden relative flex-1 min-h-0">
        <div className="relative rounded-[16px] w-full h-full">
          <img
            src="/landing/bubbles-money.png"
            alt="entry image"
            className="rounded-[16px] w-full h-full object-contain"
          />
          <div
            className="absolute inset-x-0 top-0 h-20 rounded-t-[16px]"
            style={{
              background:
                "linear-gradient(180deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.70) 50%, rgba(0, 0, 0, 0) 100%)",
            }}
          />
        </div>

        <div className="absolute top-1 left-2 right-2 flex items-center justify-between">
          <img src="/contest/gold-medal.png" alt="Rank 1" className="w-10 h-10 object-contain" />
          <div
            className="flex flex-col items-end gap-0.5"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.6)" }}
          >
            <p className="text-[12px] font-bold text-neutral-11">bubbles</p>
            <p className="text-[12px] text-neutral-11 tabular-nums">{formatNumberWithCommas(VOTES)} votes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;
