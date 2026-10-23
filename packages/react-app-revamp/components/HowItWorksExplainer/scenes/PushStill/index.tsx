/* eslint-disable @next/next/no-img-element */
import { STAGE_STYLE, type SceneProps } from "@components/HowItWorksExplainer/engine";
import { MEDAL_IMAGES } from "@components/PriceCurve/components/Voters/components/EntryRankMedal";
import { FC } from "react";

const PushStill: FC<SceneProps> = ({ script }) => {
  const underdog = script.entries[script.entries.length - 1];
  const ranked = [underdog, ...script.entries.filter(entry => entry.id !== underdog.id)];

  return (
    <div style={STAGE_STYLE} className="relative flex flex-col justify-center gap-2 px-6" aria-hidden>
      {ranked.map((entry, i) => {
        const isUnderdog = entry.id === underdog.id;
        return (
          <div
            key={entry.id}
            className={`flex h-14 items-center gap-3 rounded-[14px] border bg-true-black px-2 ${
              isUnderdog ? "border-primary-10" : "border-white/10 opacity-50"
            }`}
          >
            <img src={MEDAL_IMAGES[i + 1]} alt="" className="size-7 object-contain" />
            <img src={entry.photoSrc} alt="" className="size-10 rounded-[8px] object-cover" />
            <span className="text-[14px] font-bold text-neutral-11">{entry.name}</span>
            {isUnderdog && (
              <span className="ml-auto text-[12px] font-bold text-primary-10">#{entry.rank} → #1</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PushStill;
