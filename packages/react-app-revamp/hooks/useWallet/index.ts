import { chains, ChainWithIcon } from "@config/wagmi/chains";
import { type LoginMethod, useAccount, useLogout, useWallet as useParaWallet } from "@getpara/react-sdk-lite";
import { useMemo } from "react";
import { getAddress, isAddress } from "viem";
import { Connector, useChainId, useSwitchChain } from "wagmi";

export type WalletKind = "embedded" | "external";

interface WalletHookReturn {
  userAddress: `0x${string}` | undefined;
  walletKind: WalletKind | undefined;
  loginMethod: LoginMethod | undefined;
  isConnected: boolean;
  chain: ChainWithIcon;
  connector: Connector | undefined;
  disconnect: () => void;
  changeNetworks: (chainId: number) => void;
}

/**
 * Hook for wallet connection management supporting both Para embedded wallets
 * and external wallets (MetaMask, etc.) through Para SDK integration.
 * Copied from Juicebox useWallet hook but adapted to use both wagmi and para (we do not need most of the stuff from the original hook, so removed a bunch of stuff)
 *
 * Para supports two wallet types:
 * - Embedded: User logs in with social accounts (Google, Twitter, etc.) creating a Para account
 * - External: Traditional web3 wallets connected via wagmi (MetaMask, WalletConnect, etc.)
 */
export function useWallet(): WalletHookReturn {
  // Para SDK hooks for wallet state
  const { connectionType, external, embedded, isConnected: isAccountConnected } = useAccount();
  const { data: paraWallet } = useParaWallet(); // Only available for embedded wallets
  const { logout: paraLogout } = useLogout();
  const switchChain = useSwitchChain();

  // Wagmi hooks for external wallet support
  const chainId = useChainId();

  // Find current chain info
  const chain = chains.find(c => c.id === chainId);

  // Create appropriate signer based on wallet connection type
  // Memoized to prevent recreation on every render
  // Resolve user address based on connection type
  const { userAddress, walletKind } = useMemo(() => {
    // External wallet address comes from wagmi connection
    // Embedded wallet address comes from Para wallet
    const isExternal = connectionType === "external" && !!external?.evm?.address;
    const rawAddress = isExternal ? external.evm.address : (paraWallet?.address as `0x${string}` | undefined);
    const address = rawAddress && isAddress(rawAddress, { strict: false }) ? getAddress(rawAddress) : rawAddress;
    const kind: WalletKind | undefined = address ? (isExternal ? "external" : "embedded") : undefined;

    return { userAddress: address, walletKind: kind };
  }, [connectionType, external?.evm?.address, paraWallet?.address]);

  // wagmi connection with an expired Para session reports
  // isConnected without a resolvable address — treat that as signed out
  const isConnected = isAccountConnected && !!userAddress;

  // Disconnection always goes through Para SDK
  const disconnect = () => paraLogout();

  // Network switching with fallback to default network
  const changeNetworks = (chainId: number) => {
    switchChain.mutate({ chainId });
  };

  return {
    userAddress,
    walletKind,
    loginMethod: embedded.loginMethod,
    isConnected,
    //TODO: test if we need an undefined here?
    chain: chain as ChainWithIcon,
    connector: external?.evm?.connector,
    disconnect,
    changeNetworks,
  };
}
