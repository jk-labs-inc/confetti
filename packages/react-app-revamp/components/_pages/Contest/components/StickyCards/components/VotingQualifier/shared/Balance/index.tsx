import { useModal } from "@getpara/react-sdk-lite";
import VotingQualifierAnyoneCanVoteBalance from "./components/AnyoneCanVoteBalance";
import { useWallet } from "@hooks/useWallet";

const VotingQualifierBalance = () => {
  const { userAddress } = useWallet();
  const { openModal } = useModal();

  if (!userAddress)
    return (
      <button
        className="w-32 md:w-48 h-8 text-[16px] font-bold bg-true-black text-neutral-11 rounded-[40px] border border-neutral-11 hover:bg-neutral-11 hover:text-true-black transition-all duration-300"
        onClick={() => openModal()}
      >
        sign in
      </button>
    );

  return <VotingQualifierAnyoneCanVoteBalance userAddress={userAddress} />;
};

export default VotingQualifierBalance;
