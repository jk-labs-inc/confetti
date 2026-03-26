import Image from "next/image";

const NoVotesPlaceholderVotingOpen = () => {
  return (
    <div className="flex-1 flex items-center">
      <div className="flex items-center justify-between w-full gap-4">
        <p className="text-base text-neutral-11">this entry doesn’t have any votes. yet.</p>
        <Image src="/entry/no-votes-bubbles.png" alt="no votes" width={80} height={80} className="flex-shrink-0" />
      </div>
    </div>
  );
};

export default NoVotesPlaceholderVotingOpen;
