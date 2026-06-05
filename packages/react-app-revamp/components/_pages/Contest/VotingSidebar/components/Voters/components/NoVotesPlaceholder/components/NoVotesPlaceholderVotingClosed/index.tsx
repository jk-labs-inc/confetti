import VotingSidebarEmailSignup from "@components/_pages/Contest/VotingSidebar/components/EmailSignup";
import Image from "next/image";

const NoVotesPlaceholderVotingClosed = () => {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-[16px] text-neutral-11">
        this entry didn’t get any votes... but it’s still a winner if you’re here.
      </p>
      <Image
        src="/rewards/rewards-not-created.png"
        alt="no votes"
        width={360}
        height={220}
        className="w-full h-auto"
      />
      <VotingSidebarEmailSignup />
    </div>
  );
};

export default NoVotesPlaceholderVotingClosed;
