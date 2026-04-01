import AddFundsModal from "@components/AddFunds/components/Modal";
import SendFunds from "@components/SendFunds";
import { Menu, MenuItems } from "@headlessui/react";
import { useAddFundsChain } from "@hooks/useAddFundsChain";
import { useWallet } from "@hooks/useWallet";
import { chains } from "@config/wagmi";
import { switchChain } from "@wagmi/core";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { FC, useState } from "react";
import { mainnet } from "viem/chains";
import { useEnsAvatar, useEnsName, useBalance } from "wagmi";
import AccountButton from "./components/AccountButton";
import ProfileSection from "./components/ProfileSection";
import NavigationLinks from "./components/NavigationLinks";
import DisconnectButton from "./components/DisconnectButton";

interface AccountDropdownProps {
  address: string;
  displayName: string;
  onDisconnect: () => void;
}

const AccountDropdown: FC<AccountDropdownProps> = ({ address, displayName, onDisconnect }) => {
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [isSendFundsOpen, setIsSendFundsOpen] = useState(false);
  const { chainName, asset } = useAddFundsChain();
  const { chain: currentChain } = useWallet();
  const { data: ensName } = useEnsName({ address: address as `0x${string}`, chainId: mainnet.id });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName as string, chainId: mainnet.id });
  const { data: balance } = useBalance({ address: address as `0x${string}` });

  const handleChainSwitch = async (chainId: number) => {
    const targetChain = chains.find(chain => chain.id === chainId);
    if (!targetChain) return;

    const publicRpcUrls = targetChain.rpcUrls.public.http.filter((url): url is string => typeof url === "string");

    try {
      await switchChain(getWagmiConfig(), {
        chainId: targetChain.id,
        addEthereumChainParameter: {
          ...targetChain,
          rpcUrls: publicRpcUrls,
        },
      });
    } catch (error) {
      console.error("Failed to switch chain:", error);
    }
  };

  return (
    <>
      <Menu>
        <AccountButton ensName={ensName} displayName={displayName} />

        <MenuItems
          transition
          anchor="bottom end"
          className="w-[360px] origin-top-right rounded-2xl bg-secondary-1 text-[16px] text-neutral-11 transition duration-100 ease-out [--anchor-gap:--spacing(2)] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
        >
          <div className="flex flex-col">
            <ProfileSection
              address={address}
              ensAvatar={ensAvatar}
              ensName={ensName}
              displayName={displayName}
              balance={balance}
              currentChain={currentChain}
              availableChains={chains as unknown as typeof currentChain[]}
              onChainSwitch={handleChainSwitch}
              onAddFundsClick={() => setIsAddFundsOpen(true)}
              onSendFundsClick={() => setIsSendFundsOpen(true)}
            />
            <NavigationLinks address={address} />
            <DisconnectButton onDisconnect={onDisconnect} />
          </div>
        </MenuItems>
      </Menu>

      <AddFundsModal chain={chainName} asset={asset} isOpen={isAddFundsOpen} onClose={() => setIsAddFundsOpen(false)} />
      <SendFunds isOpen={isSendFundsOpen} onClose={() => setIsSendFundsOpen(false)} />
    </>
  );
};

export default AccountDropdown;
