import TipTapEditorControls from "@components/UI/TipTapEditorControls";
import { Editor, EditorContent } from "@tiptap/react";
import { FC } from "react";
import { useMediaQuery } from "react-responsive";

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
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex bg-true-black z-10 justify-start w-full p-1 border-y border-neutral-2">
        <TipTapEditorControls editor={editorProposal} />
      </div>

      <div className={`bg-true-black rounded-[16px] border-true-black ${isMobile ? "" : "shadow-file-upload p-2"}`}>
        <EditorContent
          editor={editorProposal}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`bg-secondary-1 outline-none rounded-[16px] w-full overflow-y-auto h-40 md:h-44 ${
            isDragging ? "backdrop-blur-md opacity-70" : ""
          }`}
        />
      </div>
    </div>
  );
};

export default DialogModalSendProposalEditor;
