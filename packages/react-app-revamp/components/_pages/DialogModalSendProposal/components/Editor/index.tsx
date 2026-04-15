import TipTapEditorControls from "@components/UI/TipTapEditorControls";
import { Editor, EditorContent } from "@tiptap/react";
import { FC } from "react";

interface DialogModalSendProposalEditorProps {
  editorProposal: Editor | null;
  isDragging?: boolean;
  handleDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave?: (event: React.DragEvent<HTMLDivElement>) => void;
}

const DialogModalSendProposalEditor: FC<DialogModalSendProposalEditorProps> = ({
  editorProposal,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  isDragging,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex bg-true-black z-10 justify-start w-full p-1 border-y border-neutral-2">
        <TipTapEditorControls editor={editorProposal} />
      </div>

      <EditorContent
        editor={editorProposal}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`p-4 text-[16px] bg-secondary-1 outline-none rounded-[10px] border border-neutral-17 w-full min-h-40 md:h-44 md:overflow-y-auto ${
          isDragging ? "backdrop-blur-md opacity-70" : ""
        }`}
      />
    </div>
  );
};

export default DialogModalSendProposalEditor;
