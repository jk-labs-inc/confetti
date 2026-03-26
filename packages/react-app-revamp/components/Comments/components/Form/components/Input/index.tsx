/* eslint-disable react-hooks/exhaustive-deps */
import UserProfileDisplay from "@components/UI/UserProfileDisplay";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { useModal } from "@getpara/react-sdk-lite";
import { DisableEnter, ShiftEnterCreateExtension } from "@helpers/editor";
import { useWallet } from "@hooks/useWallet";
import Placeholder from "@tiptap/extension-placeholder";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { switchChain } from "@wagmi/core";
import { FC, useEffect, useRef, useState } from "react";
import { useMedia } from "react-use";
import CommentFormInputSubmitButton from "./components/SubmitButton";

interface CommentsFormInputProps {
  contestChainId: number;
  isAdding: boolean;
  isAddingSuccess: boolean;
  onSend?: (comment: string) => void;
}

interface CommentEditorConfigArgs {
  content: string;
  placeholderText: string;
  onUpdate: any;
  isMobile: boolean;
}

const commentEditorConfig = ({ content, placeholderText, onUpdate, isMobile }: CommentEditorConfigArgs) => {
  let extensions = [
    StarterKit,
    Placeholder.configure({
      emptyEditorClass: "is-editor-create-flow-empty",
      placeholder: placeholderText,
    }),
  ];

  if (!isMobile) {
    extensions = [...extensions, ShiftEnterCreateExtension, DisableEnter];
  }

  return {
    extensions: extensions,
    content: content,
    editorProps: {
      attributes: {
        class: "prose prose-invert grow focus:outline-none",
      },
    },
    onUpdate: onUpdate,
    immediatelyRender: false,
  };
};

const CommentsFormInput: FC<CommentsFormInputProps> = ({ onSend, contestChainId, isAddingSuccess, isAdding }) => {
  const { openModal } = useModal();
  const { userAddress, isConnected, chain } = useWallet();
  const [commentContent, setCommentContent] = useState("");
  const [allowSend, setAllowSend] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMedia("(max-width: 768px)");
  const placeholderText = "add a comment...";
  const isUserOnCorrectNetwork = chain?.id === contestChainId;

  const commentEditor = useEditor(
    commentEditorConfig({
      content: commentContent,
      placeholderText: placeholderText,
      onUpdate: ({ editor }: { editor: Editor }) => {
        const content = editor.getHTML();

        if (containerRef.current) {
          setContainerHeight(containerRef.current.clientHeight);
        }

        if (editor.getText().length > 0) {
          setAllowSend(true);
        } else {
          setAllowSend(false);
        }

        setCommentContent(content);
      },
      isMobile: isMobile,
    }),
  );

  useEffect(() => {
    if (!isAddingSuccess) return;

    setCommentContent("");
    setAllowSend(false);
    commentEditor?.commands.clearContent();
  }, [isAddingSuccess]);

  const handleSendComment = async () => {
    if (!allowSend || isAdding) return;

    if (!isConnected) {
      openModal();
      return;
    }

    if (!isUserOnCorrectNetwork) {
      await switchChain(getWagmiConfig(), { chainId: contestChainId });
      return;
    }

    onSend?.(commentContent);
  };

  const handleKeyDown = async (event: React.KeyboardEvent<HTMLDivElement>) => {
    const allowEnter = !event.shiftKey && !isMobile;
    if (event.key === "Enter" && allowEnter) {
      handleSendComment();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`flex ${
        containerHeight > 48 ? "items-end" : "items-center"
      } p-2 gap-3 w-full md:max-w-[544px] rounded-4xl bg-secondary-1 border border-neutral-17`}
    >
      <div>
        <UserProfileDisplay avatarVersion ethereumAddress={userAddress ?? ""} shortenOnFallback size="compact" />
      </div>
      <EditorContent
        editor={commentEditor}
        className="bg-transparent outline-none w-full overflow-y-auto max-h-[300px]"
        onKeyDown={handleKeyDown}
      />
      <CommentFormInputSubmitButton
        allowSend={allowSend}
        isAdding={isAdding}
        isMobile={isMobile}
        isConnected={isConnected}
        onSend={handleSendComment}
        onConnect={() => openModal()}
      />
    </div>
  );
};

export default CommentsFormInput;
