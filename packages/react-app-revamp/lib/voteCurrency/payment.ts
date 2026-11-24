import { Config, readContract, simulateContract, waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { erc20Abi, isAddressEqual, parseEventLogs } from "viem";
import { ChargedUnits, TokenVoteCurrency, VoteCostAuthorization, VotePayment } from "./types";
import { toChargedUnits } from "./units";

const ALLOWANCE_VISIBILITY_ATTEMPTS = 10;
const ALLOWANCE_VISIBILITY_INTERVAL_MS = 500;

export class VoteAllowanceNotVisibleError extends Error {
  constructor(contest: string) {
    super(`the approval for contest ${contest} was mined but no RPC node reports it yet`);
    this.name = "VoteAllowanceNotVisibleError";
  }
}

export class VoteApprovalTooLowError extends Error {
  constructor(symbol: string) {
    super(`the approved ${symbol} amount is lower than the cost of these votes`);
    this.name = "VoteApprovalTooLowError";
  }
}

interface TokenVoteCostAuthorization extends VoteCostAuthorization {
  voteCurrency: TokenVoteCurrency;
}

const pause = (durationMs: number) => new Promise(resolve => setTimeout(resolve, durationMs));

const readAllowance = (
  config: Config,
  { voteCurrency, voter, contest, chainId }: TokenVoteCostAuthorization,
): Promise<bigint> =>
  readContract(config, {
    address: voteCurrency.address,
    abi: erc20Abi,
    functionName: "allowance",
    args: [voter, contest],
    chainId,
  });

async function approveExactly(
  config: Config,
  { voteCurrency, voter, contest, chainId }: TokenVoteCostAuthorization,
  amount: ChargedUnits,
): Promise<void> {
  const approval = {
    address: voteCurrency.address,
    abi: erc20Abi,
    functionName: "approve",
    args: [contest, amount],
    chainId,
    account: voter,
  } as const;

  await simulateContract(config, approval);
  const hash = await writeContract(config, approval);
  const receipt = await waitForTransactionReceipt(config, { chainId, hash });
  const grantedApproval = parseEventLogs({ abi: erc20Abi, eventName: "Approval", logs: receipt.logs }).find(
    log =>
      isAddressEqual(log.address, voteCurrency.address) &&
      isAddressEqual(log.args.owner, voter) &&
      isAddressEqual(log.args.spender, contest),
  );

  if (grantedApproval && grantedApproval.args.value < amount) throw new VoteApprovalTooLowError(voteCurrency.symbol);
}

async function confirmAllowanceVisible(
  config: Config,
  authorization: TokenVoteCostAuthorization,
  requiredAllowance: ChargedUnits,
): Promise<void> {
  for (let attempt = 0; attempt < ALLOWANCE_VISIBILITY_ATTEMPTS; attempt++) {
    if (attempt > 0) await pause(ALLOWANCE_VISIBILITY_INTERVAL_MS);
    if ((await readAllowance(config, authorization)) >= requiredAllowance) return;
  }

  throw new VoteAllowanceNotVisibleError(authorization.contest);
}

export async function authorizeVoteCost(config: Config, authorization: VoteCostAuthorization): Promise<VotePayment> {
  const { voteCurrency, cost } = authorization;

  if (voteCurrency.kind === "native") return { value: cost, wasApproved: false };

  const tokenAuthorization = { ...authorization, voteCurrency };
  const requiredAllowance = toChargedUnits(voteCurrency, cost);
  const isAllowanceExact =
    requiredAllowance === 0n || (await readAllowance(config, tokenAuthorization)) === requiredAllowance;

  if (isAllowanceExact) return { value: undefined, wasApproved: false };

  await authorization.onApprovalNeeded?.();
  await approveExactly(config, tokenAuthorization, requiredAllowance);
  await confirmAllowanceVisible(config, tokenAuthorization, requiredAllowance);

  return { value: undefined, wasApproved: true };
}
