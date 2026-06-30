import Image from "next/image";

const NoVotesPlaceholderVotingOpen = () => {
  return (
    <div className="flex items-center w-full gap-4">
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <p className="text-[16px] text-neutral-11 font-bold">well this is embarrassing.</p>
        <p className="text-[16px] text-neutral-11">
          this entry doesn’t have any <br /> votes. yet.
        </p>
        <p className="text-[16px] text-neutral-11">but you can add some above...</p>
      </div>
      <Image src="/entry/no-votes-bubbles.png" alt="no votes" width={140} height={140} className="flex-shrink-0" />
    </div>
  );
};

export default NoVotesPlaceholderVotingOpen;
