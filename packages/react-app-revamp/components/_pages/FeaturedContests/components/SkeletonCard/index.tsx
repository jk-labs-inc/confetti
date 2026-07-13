import Skeleton from "react-loading-skeleton";

const SkeletonCard = () => {
  return (
    <div className="flex flex-col gap-4 p-4 w-full md:w-80 rounded-2xl border border-[#323232] bg-[#141414]">
      {/* CardHeader skeleton: 48x48 thumb + two title lines */}
      <div className="flex items-center gap-3 min-h-12">
        <Skeleton width={48} height={48} borderRadius={8} baseColor="#212121" highlightColor="#100816" />
        <div className="flex-1 flex flex-col gap-1">
          <Skeleton height={18} borderRadius={4} baseColor="#212121" highlightColor="#100816" />
          <Skeleton height={18} width="60%" borderRadius={4} baseColor="#212121" highlightColor="#100816" />
        </div>
      </div>
      {/* EntriesList skeleton: 3 rows mobile / 2 desktop, same fixed box as the real card */}
      <div className="h-[164px] md:h-[116px] flex flex-col gap-2">
        {[0, 1, 2].map(index => (
          <div key={index} className={`flex items-center gap-3 h-10 shrink-0 ${index === 2 ? "md:hidden" : ""}`}>
            <Skeleton width={36} height={36} borderRadius={6} baseColor="#212121" highlightColor="#100816" />
            <div className="flex-1">
              <Skeleton height={14} borderRadius={4} baseColor="#212121" highlightColor="#100816" />
            </div>
          </div>
        ))}
      </div>
      {/* CardFooter skeleton */}
      <div className="flex items-center h-8">
        <Skeleton width={180} height={14} borderRadius={4} baseColor="#212121" highlightColor="#100816" />
      </div>
    </div>
  );
};

export default SkeletonCard;
