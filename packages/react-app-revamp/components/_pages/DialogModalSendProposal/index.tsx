/* eslint-disable react-hooks/exhaustive-deps */
import Iframe from "@components/tiptap/Iframe";
import { chains } from "@config/wagmi";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { extractPathSegments } from "@helpers/extractPath";
import { emailRegex } from "@helpers/regex";
import {
  SubmissionCache,
  loadSubmissionFromLocalStorage,
  removeSubmissionFromLocalStorage,
  saveSubmissionToLocalStorage,
} from "@helpers/submissionCaching";
import { useContestStore } from "@hooks/useContest/store";
import { useEditorStore } from "@hooks/useEditor/store";
import useEmailSignup from "@hooks/useEmailSignup";
import useSubmitProposal from "@hooks/useSubmitProposal";
import { useSubmitProposalStore } from "@hooks/useSubmitProposal/store";
import { useUploadImageStore } from "@hooks/useUploadImage";
import { useWallet } from "@hooks/useWallet";
import Document from "@tiptap/extension-document";
import Heading from "@tiptap/extension-heading";
import Image from "@tiptap/extension-image";
import { Link as TiptapExtensionLink } from "@tiptap/extension-link";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import Text from "@tiptap/extension-text";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { switchChain } from "@wagmi/core";
import { usePathname } from "next/navigation";
import { FC, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useBalance } from "wagmi";
import DialogModalSendProposalDesktopLayout from "./Desktop";
import DialogModalSendProposalMobileLayout from "./Mobile";

interface DialogModalSendProposalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const DialogModalSendProposal: FC<DialogModalSendProposalProps> = ({ isOpen, setIsOpen }) => {
  const { userAddress, chain } = useWallet();
  const asPath = usePathname();
  const isMobile = useMediaQuery({ maxWidth: "768px" });
  const { subscribeUser, checkIfEmailExists } = useEmailSignup();
  const { chainName, address: contestId } = extractPathSegments(asPath ?? "");
  const { sendProposal } = useSubmitProposal();
  const {
    wantsSubscription,
    emailForSubscription,
    setWantsSubscription,
    setEmailForSubscription,
    setEmailAlreadyExists,
  } = useSubmitProposalStore(state => state);
  const { votesOpen, charge } = useContestStore(state => state);
  const { data: accountData } = useBalance({
    address: userAddress as `0x${string}`,
  });
  const { setRevertTextOption } = useEditorStore(state => state);
  const chainId = chains.filter(
    (chain: { name: string }) => chain.name.toLowerCase().replace(" ", "") === chainName,
  )?.[0]?.id;
  const savedProposal = loadSubmissionFromLocalStorage("submissions", contestId);
  const [proposal, setProposal] = useState(savedProposal?.content || "");
  const isCorrectNetwork = chainId === chain?.id;
  const [isDragging, setIsDragging] = useState(false);
  const { uploadImage } = useUploadImageStore(state => state);
  const placeholderText = "this is my description about the entry (optional)...";

  const editorProposal = useEditor({
    extensions: [
      StarterKit,
      Document,
      Paragraph,
      Text,
      Image,
      Heading.configure({
        levels: [1, 2, 3, 4],
      }),
      TiptapExtensionLink,
      Placeholder.configure({
        emptyEditorClass: "is-editor-empty",
        placeholder: placeholderText,
      }),
      Iframe,
    ],
    content: proposal,
    editorProps: {
      attributes: {
        class: "prose prose-invert pt-4 pl-4 grow focus:outline-none",
      },
      handleDOMEvents: {
        keydown: (view, event) => {
          if (event.key === "Enter") {
            setRevertTextOption(true);
          }
        },
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      setProposal(content);

      const submissionCache: SubmissionCache = {
        contestId,
        content,
        expiresAt: votesOpen,
      };
      saveSubmissionToLocalStorage("submissions", submissionCache);
    },
    immediatelyRender: false,
  });

  const onSwitchNetwork = async () => {
    await switchChain(getWagmiConfig(), { chainId });
  };

  const handleSubscription = async () => {
    if (!wantsSubscription || !emailForSubscription || !emailForSubscription.match(emailRegex)) {
      return null;
    }

    // Check if the email already exists
    const emailExists = await checkIfEmailExists({ emailAddress: emailForSubscription, userAddress: userAddress });
    if (emailExists) {
      setEmailAlreadyExists(true);
      return null;
    }

    if (!userAddress) {
      return null;
    }

    return subscribeUser(emailForSubscription, userAddress, false);
  };

  const onSubmitProposal = async () => {
    const promises = [sendProposal(proposal.trim())];

    const subscriptionPromise = await handleSubscription();
    if (subscriptionPromise) {
      promises.push(subscriptionPromise);
    }

    try {
      const [proposalResult] = await Promise.all(promises);

      if (proposalResult) {
        // Clean up local storage before navigation (which happens in sendProposal)
        removeSubmissionFromLocalStorage("submissions", contestId);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setWantsSubscription(false);
      setEmailForSubscription("");
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];

    if (file && file.type.startsWith("image/")) {
      try {
        const imageUrl = await uploadImage(file);
        if (imageUrl) {
          editorProposal?.chain().focus().setImage({ src: imageUrl }).run();
        } else {
          console.error("Received no URL from the upload.");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <>
      {isMobile ? (
        <DialogModalSendProposalMobileLayout
          chainName={chainName}
          contestId={contestId}
          proposal={proposal}
          editorProposal={editorProposal}
          address={userAddress ?? ""}
          charge={charge}
          accountData={accountData}
          isOpen={isOpen}
          isCorrectNetwork={isCorrectNetwork}
          setIsOpen={setIsOpen}
          onSwitchNetwork={onSwitchNetwork}
          onSubmitProposal={onSubmitProposal}
        />
      ) : (
        <DialogModalSendProposalDesktopLayout
          proposal={proposal}
          chainName={chainName}
          contestId={contestId}
          editorProposal={editorProposal}
          address={userAddress ?? ""}
          charge={charge}
          accountData={accountData}
          isOpen={isOpen}
          isCorrectNetwork={isCorrectNetwork}
          isDragging={isDragging}
          setIsOpen={setIsOpen}
          handleDrop={handleDrop}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          onSwitchNetwork={onSwitchNetwork}
          onSubmitProposal={onSubmitProposal}
        />
      )}
    </>
  );
};

export default DialogModalSendProposal;
