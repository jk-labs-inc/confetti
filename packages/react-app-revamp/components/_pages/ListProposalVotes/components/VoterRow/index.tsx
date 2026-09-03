import UserProfileDisplay from "@components/UI/UserProfileDisplay";
import { formatNumberWithCommas } from "@helpers/formatNumber";
import { FC } from "react";
import AnimatedVoteCount from "./components/AnimatedVoteCount";
interface VoteRowProps {
  votesPerAddress: Record<string, number>;
  address: string;
  addressesLength: number;
  isCurrentUser: boolean;
  className?: string;
}

const VoterRow: FC<VoteRowProps> = ({ votesPerAddress, address, addressesLength, isCurrentUser, className }) => {
  const textClassName = `${isCurrentUser ? "text-secondary-11" : "text-neutral-11"} ${className ?? ""}`;

  return (
    <div
      className={`flex justify-between items-center font-bold pb-1 ${
        addressesLength > 1 ? "border-b border-primary-3" : ""
      }`}
    >
      <UserProfileDisplay ethereumAddress={address} shortenOnFallback={true} textColor={textClassName} size="extraSmall" showBy={false} />
      <AnimatedVoteCount votes={votesPerAddress[address]} className={textClassName}>
        {formatNumberWithCommas(votesPerAddress[address])} {votesPerAddress[address] === 1 ? "vote" : "votes"}
      </AnimatedVoteCount>
    </div>
  );
};

export default VoterRow;
