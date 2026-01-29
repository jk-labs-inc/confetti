import { chains, ChainWithIcon } from "@config/wagmi/chains";
import { useAccount, useLogout, useModal, useWallet as useParaWallet } from "@getpara/react-sdk-lite";
import { useMemo } from "react";
import { Connector, useChainId, useSwitchChain } from "wagmi";

interface WalletHookReturn {
  userAddress: `0x${string}` | undefined;
  isConnected: boolean;
  chain: ChainWithIcon;
  connector: Connector | undefined;
  connect: () => Promise<void>;
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
  const { connectionType, external, isConnected } = useAccount();
  const { data: paraWallet } = useParaWallet(); // Only available for embedded wallets
  const { logout: paraLogout } = useLogout();
  const { openModal } = useModal();

  // Wagmi hooks for external wallet support
  const chainId = useChainId();
  const switchChain = useSwitchChain();

  // Find current chain info
  const chain = chains.find(c => c.id === chainId);

  // Create appropriate signer based on wallet connection type
  // Memoized to prevent recreation on every render
  // Resolve user address based on connection type
  const userAddress = useMemo(() => {
    // External wallet address comes from wagmi connection
    if (connectionType === "external" && external?.evm?.address) {
      return external.evm.address;
    }
    // Embedded wallet address comes from Para wallet
    return paraWallet?.address as `0x${string}` | undefined;
  }, [connectionType, external?.evm?.address, paraWallet?.address]);

  // Connection handler - returns existing promise if already connected
  const connect = async () => {
    if (isConnected) {
      return Promise.resolve();
    }
    return openModal();
  };

  // Disconnection always goes through Para SDK
  const disconnect = () => paraLogout();

  // Network switching with fallback to default network
  const changeNetworks = (chainId: number) => {
    switchChain.mutate({ chainId });
  };

  return {
    userAddress,
    isConnected,
    //TODO: test if we need an undefined here?
    chain: chain as ChainWithIcon,
    connector: external?.evm?.connector,
    connect,
    disconnect,
    changeNetworks,
  };
}
