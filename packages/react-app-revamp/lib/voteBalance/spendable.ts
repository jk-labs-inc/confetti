import { STANDARD_ANYONE_CAN_VOTE_GAS_LIMIT } from "@hooks/useUserSubmitQualification/utils";

export const spendableWei = ({ balanceWei, gasPriceWei }: { balanceWei: bigint; gasPriceWei: bigint }): bigint => {
  const gasReserveWei = gasPriceWei * BigInt(STANDARD_ANYONE_CAN_VOTE_GAS_LIMIT);
  return balanceWei > gasReserveWei ? balanceWei - gasReserveWei : 0n;
};
