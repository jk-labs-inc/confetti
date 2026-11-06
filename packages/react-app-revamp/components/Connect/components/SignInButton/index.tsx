import ClaimVoteSticker from "@components/ClaimVote/ClaimVoteSticker";
import XClaimSignInHoverCard from "@components/XClaim/entry/XClaimSignInHoverCard";
import { useSpotsTakenUntil } from "@hooks/useXClaim/useSpotsTakenUntil";
import { FC } from "react";

interface SignInButtonProps {
  onSignIn: () => void;
}

const SignInButton: FC<SignInButtonProps> = ({ onSignIn }) => {
  const takenUntil = useSpotsTakenUntil();

  return (
    <div className="group/signin relative">
      <button
        onClick={onSignIn}
        type="button"
        className="w-36 h-8 bg-secondary-1 border border-primary-3 text-base font-bold text-neutral-9 rounded-[40px]"
      >
        sign in
      </button>
      {takenUntil && (
        <>
          <ClaimVoteSticker className="absolute -top-3 -right-1.5 px-2 py-0.5 text-[12px] rotate-8" />
          <XClaimSignInHoverCard nextReleaseAt={takenUntil} />
        </>
      )}
    </div>
  );
};

export default SignInButton;
