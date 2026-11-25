import { STANDARD_ANYONE_CAN_VOTE_GAS_LIMIT } from "@hooks/useUserSubmitQualification/utils";
import { VoteCurrency } from "lib/voteCurrency";

export const voteFeeGasLimit = (voteCurrency: VoteCurrency | undefined): number =>
  voteCurrency?.kind === "token" ? voteCurrency.approveAndVoteGasLimit : STANDARD_ANYONE_CAN_VOTE_GAS_LIMIT;

export const spendableWei = ({
  balanceWei,
  gasPriceWei,
  feeGasLimit = STANDARD_ANYONE_CAN_VOTE_GAS_LIMIT,
}: {
  balanceWei: bigint;
  gasPriceWei: bigint;
  feeGasLimit?: number;
}): bigint => {
  const gasReserveWei = gasPriceWei * BigInt(feeGasLimit);
  return balanceWei > gasReserveWei ? balanceWei - gasReserveWei : 0n;
};
