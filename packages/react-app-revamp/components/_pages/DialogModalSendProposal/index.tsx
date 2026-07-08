/* eslint-disable react-hooks/exhaustive-deps */
import Iframe from "@components/tiptap/Iframe";
import { toastError } from "@components/UI/Toast";
import { chains } from "@config/wagmi";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { extractPathSegments } from "@helpers/extractPath";
import { emailRegex } from "@helpers/regex";
import { useContestStore } from "@hooks/useContest/store";
import { useEditorStore } from "@hooks/useEditor/store";
import useEmailSignup from "@hooks/useEmailSignup";
import usePhoneNumberSignup from "@hooks/usePhoneNumberSignup";
import useSubmitProposal from "@hooks/useSubmitProposal";
import { useSubmitProposalStore } from "@hooks/useSubmitProposal/store";
import { useUploadImageStore } from "@hooks/useUploadImage";
import { useWallet } from "@hooks/useWallet";
import { EMPTY_PHONE_NUMBER, isPhoneNumberEmpty, isValidPhoneNumber, phoneNumberToE164 } from "lib/phone";
import { validateImageUpload } from "lib/image/uploadValidation";
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
  const { isConnected, userAddress, chain } = useWallet();
  const asPath = usePathname();
  const isMobile = useMediaQuery({ maxWidth: "768px" });
  const { subscribeUser, checkIfEmailExists } = useEmailSignup();
  const { subscribePhoneNumber, checkIfPhoneNumberExists } = usePhoneNumberSignup();
  const { chainName, address: contestId } = extractPathSegments(asPath ?? "");
  const { sendProposal } = useSubmitProposal();
  const {
    wantsSubscription,
    emailForSubscription,
    phoneNumberForSubscription,
    setWantsSubscription,
    setEmailForSubscription,
    setEmailAlreadyExists,
    setPhoneNumberForSubscription,
    setPhoneNumberAlreadyExists,
  } = useSubmitProposalStore(state => state);
  const { charge } = useContestStore(state => state);
  const { data: accountData } = useBalance({
    address: userAddress as `0x${string}`,
  });
  const { setRevertTextOption } = useEditorStore(state => state);
  const chainId = chains.filter(
    (chain: { name: string }) => chain.name.toLowerCase().replace(" ", "") === chainName,
  )?.[0]?.id;
  const [proposal, setProposal] = useState("");
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
        class: "prose prose-invert grow focus:outline-none",
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
      setProposal(editor.getHTML());
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

    // check if the email already exists
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

  const handlePhoneNumberSubscription = async () => {
    if (isPhoneNumberEmpty(phoneNumberForSubscription) || !isValidPhoneNumber(phoneNumberForSubscription)) {
      return null;
    }

    const phoneNumberE164 = phoneNumberToE164(phoneNumberForSubscription);

    // check if the phone number already exists
    const phoneNumberExists = await checkIfPhoneNumberExists({
      phoneNumber: phoneNumberE164,
      userAddress,
      displayToasts: false,
    });
    if (phoneNumberExists) {
      setPhoneNumberAlreadyExists(true);
      return null;
    }

    if (!userAddress) {
      return null;
    }

    return subscribePhoneNumber(phoneNumberE164, userAddress, false);
  };

  const onSubmitProposal = async () => {
    const promises: Promise<unknown>[] = [sendProposal(proposal.trim())];

    promises.push(handleSubscription().catch(() => null));
    promises.push(handlePhoneNumberSubscription().catch(() => null));

    try {
      const [proposalResult] = await Promise.all(promises);

      if (proposalResult) {
        editorProposal?.commands.clearContent();
        setProposal("");
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setWantsSubscription(false);
      setEmailForSubscription("");
      setEmailAlreadyExists(false);
      setPhoneNumberForSubscription(EMPTY_PHONE_NUMBER);
      setPhoneNumberAlreadyExists(false);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (!file) return;

    const uploadError = await validateImageUpload(file);
    if (uploadError) {
      toastError({ message: uploadError });
      return;
    }

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
          charge={charge}
          accountData={accountData}
          isOpen={isOpen}
          isConnected={isConnected}
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
          charge={charge}
          accountData={accountData}
          isOpen={isOpen}
          isConnected={isConnected}
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
