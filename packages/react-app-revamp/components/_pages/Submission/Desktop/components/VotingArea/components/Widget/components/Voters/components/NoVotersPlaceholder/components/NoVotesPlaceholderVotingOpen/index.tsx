import Image from "next/image";

const NoVotesPlaceholderVotingOpen = () => {
  return (
    <div className="flex-1 flex flex-col justify-center items-center">
      <div className="flex items-center justify-between">
        <p className="text-base text-neutral-11">this entry doesn’t have any votes. yet.</p>
        <Image src="/entry/no-votes-bubbles.png" alt="no votes" width={144} height={144} />
      </div>
    </div>
  );
};

export default NoVotesPlaceholderVotingOpen;
