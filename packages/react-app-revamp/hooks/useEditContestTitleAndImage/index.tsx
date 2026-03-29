import MultiStepToast, { ToastMessage } from "@components/UI/MultiStepToast";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { useContestStore } from "@hooks/useContest/store";
import { simulateContract, writeContract } from "@wagmi/core";
import { useRef } from "react";
import { toast } from "react-toastify";
import { type Abi } from "viem";
import { useShallow } from "zustand/shallow";

interface UseEditContestTitleAndImageProps {
  contestAbi: Abi;
  contestAddress: string;
}

const useEditContestTitleAndImage = ({ contestAbi, contestAddress }: UseEditContestTitleAndImageProps) => {
  const { setContestPrompt, setContestName } = useContestStore(
    useShallow(state => ({
      setContestPrompt: state.setContestPrompt,
      setContestName: state.setContestName,
    })),
  );
  const toastIdRef = useRef<string | number | null>(null);

  const updateContestTitleAndImage = async (newTitle: string, newPrompt: string) => {
    const messages: ToastMessage[] = [
      {
        message: "updating title...",
        successMessage: "title updated",
        status: "pending",
      },
      {
        message: "updating image...",
        successMessage: "image updated",
        status: "pending",
      },
    ];

    const updateTitle = async () => {
      const { request } = await simulateContract(getWagmiConfig(), {
        abi: contestAbi,
        address: contestAddress as `0x${string}`,
        functionName: "setName",
        args: [newTitle],
      });

      if (!request) throw new Error("failed to update title");
      await writeContract(getWagmiConfig(), request);

      setContestName(newTitle);
      document.title = newTitle;
    };

    const updatePrompt = async () => {
      const { request } = await simulateContract(getWagmiConfig(), {
        abi: contestAbi,
        address: contestAddress as `0x${string}`,
        functionName: "setPrompt",
        args: [newPrompt],
      });

      if (!request) throw new Error("failed to update image");
      await writeContract(getWagmiConfig(), request);

      setContestPrompt(newPrompt);
    };

    const promises = [updateTitle, updatePrompt];

    toastIdRef.current = toast(
      <MultiStepToast
        messages={messages}
        promises={promises}
        toastIdRef={toastIdRef}
        completionMessage="contest details updated successfully!"
      />,
      {
        position: "bottom-center",
        autoClose: false,
        icon: false,
      },
    );

    return toastIdRef.current;
  };

  return {
    updateContestTitleAndImage,
  };
};

export default useEditContestTitleAndImage;
