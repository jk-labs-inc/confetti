import { FC } from "react";

interface RankBadgeProps {
  rank: number;
  size?: "sm" | "md";
}

const RankBadge: FC<RankBadgeProps> = ({ rank, size = "md" }) => {
  const outerSize = size === "sm" ? "w-6 h-6" : "w-10 h-10";
  const innerSize = size === "sm" ? "w-[22px] h-[22px]" : "w-[37px] h-[37px]";
  const textSize = size === "sm" ? "text-[10px]" : "text-[16px]";

  return (
    <div
      className={`${outerSize} rounded-full flex items-center justify-center`}
      style={{
        background:
          "linear-gradient(180deg, rgba(90, 90, 90, 0.6) 0%, rgba(52, 51, 51, 0.6) 25%, rgba(84, 84, 84, 0.6) 50%, rgba(49, 48, 48, 0.6) 75%, rgba(119, 119, 119, 0.6) 100%)",
      }}
    >
      <div
        className={`${innerSize} rounded-full flex items-center justify-center`}
        style={{
          background:
            "radial-gradient(80.83% 82.38% at 93.67% 19.94%, rgba(0, 0, 0, 0.6) 0%, rgba(67, 67, 67, 0.6) 100%)",
          border: "0.1px solid #000000",
        }}
      >
        <span
          className={`${textSize} font-bold`}
          style={{
            background: "linear-gradient(180deg, #9D9D9D 33.75%, #E5E5E5 49.37%, #9D9D9D 65%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {rank}
        </span>
      </div>
    </div>
  );
};

export default RankBadge;
