import CreateGradientTitle from "@components/_pages/Create/components/GradientTitle";
import CreateFlowPromptPreview from "@components/_pages/Create/components/PromptPreview";
import CreateFlowPreviewToggle from "@components/_pages/Create/components/PreviewToggle";
import DialogModalV4 from "@components/UI/DialogModalV4";
import ResizableEditor from "@components/UI/ResizableEditor";
import TipTapEditorControls from "@components/UI/TipTapEditorControls";
import { createEditorConfig } from "@helpers/createEditorConfig";
import { Editor, useEditor } from "@tiptap/react";
import { FC, useState } from "react";
import { useMediaQuery } from "react-responsive";

export interface EditPrompt {
  contestSummary: string;
  contestEvaluate: string;
  contestContactDetails: string;
}

interface EditContestPromptModalProps {
  isOpen: boolean;
  prompt: EditPrompt;
  setIsCloseModal?: (isOpen: boolean) => void;
  handleEditPrompt?: (prompt: EditPrompt) => void;
  handleSavePrompt?: () => void;
}

const EditContestPromptModal: FC<EditContestPromptModalProps> = ({
  isOpen,
  prompt,
  setIsCloseModal,
  handleEditPrompt,
  handleSavePrompt,
}) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const editorSummarize = useEditor({
    ...createEditorConfig({
      content: prompt.contestSummary,
      placeholderText: isMobile
        ? "core team will pick best feature idea"
        : "our core team will vote on $1000 for best feature proposal",
      onUpdate: ({ editor }: { editor: Editor }) => {
        const content = editor.getHTML();

        handleEditPrompt?.({
          ...prompt,
          contestSummary: content,
        });
      },
    }),
    onFocus: () => setActiveEditor(editorSummarize),
    immediatelyRender: false,
  });

  const editorEvaluateVoters = useEditor({
    ...createEditorConfig({
      content: prompt.contestEvaluate,
      placeholderText: isMobile
        ? "pick which will bring the most users"
        : "voters should vote on the feature that will bring the most users",
      onUpdate: ({ editor }: { editor: Editor }) => {
        const content = editor.getHTML();

        handleEditPrompt?.({
          ...prompt,
          contestEvaluate: content,
        });
      },
    }),
    onFocus: () => setActiveEditor(editorEvaluateVoters),
    immediatelyRender: false,
  });

  const editorContactDetails = useEditor({
    ...createEditorConfig({
      content: prompt.contestContactDetails,
      placeholderText: isMobile
        ? "i'm on telegram: @me"
        : "we have a telegram group for everyone to coordinate at tgexample.com",
      onUpdate: ({ editor }: { editor: Editor }) => {
        const content = editor.getHTML();

        handleEditPrompt?.({
          ...prompt,
          contestContactDetails: content,
        });
      },
    }),
    onFocus: () => setActiveEditor(editorContactDetails),
    immediatelyRender: false,
  });

  const onSavePrompt = () => {
    if (editorSummarize?.isEmpty || editorEvaluateVoters?.isEmpty) return;

    handleSavePrompt?.();
    setIsCloseModal?.(false);
  };

  return (
    <DialogModalV4 isOpen={isOpen} onClose={() => setIsCloseModal?.(false)}>
      <div className="flex flex-col gap-14 py-6 md:py-16 pl-8 md:pl-32 pr-4 md:pr-16 max-h-screen overflow-y-auto">
        <div className="flex w-full justify-between items-center">
          <div className=" flex items-center justify-between w-full md:w-[656px]">
            <p className="text-[24px] text-neutral-11 font-bold">edit prompt</p>
            <CreateFlowPreviewToggle onClick={() => setIsPreviewOpen(!isPreviewOpen)} />
          </div>
          <img
            src="/modal/modal_close.svg"
            width={39}
            height={33}
            alt="close"
            className="hidden md:block cursor-pointer"
            onClick={() => setIsCloseModal?.(false)}
          />
        </div>
        {isPreviewOpen ? (
          <div className="w-80 xs:w-[460px] sm:w-[560px]">
            <CreateFlowPromptPreview
              summarize={{ content: prompt.contestSummary, isEmpty: editorSummarize?.isEmpty ?? true }}
              evaluateVoters={{ content: prompt.contestEvaluate, isEmpty: editorEvaluateVoters?.isEmpty ?? true }}
              contactDetails={{
                content: prompt.contestContactDetails ?? "",
                isEmpty: editorContactDetails?.isEmpty ?? true,
              }}
            />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              <div className="flex bg-true-black z-10 justify-start w-full md:w-[640px] p-1 border-y border-neutral-2">
                <TipTapEditorControls editor={activeEditor ? activeEditor : editorSummarize} />
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-4">
                    <CreateGradientTitle additionalInfo="required">
                      summarize the contest, rewards, and voters
                    </CreateGradientTitle>
                    <div className="flex flex-col gap-2 w-full md:w-[640px]">
                      <ResizableEditor editor={editorSummarize} minHeight={80} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <CreateGradientTitle additionalInfo="required">
                      how should voters evaluate if an entry is <i>good</i> ?
                    </CreateGradientTitle>
                    <div className="w-full md:w-[640px]">
                      <ResizableEditor editor={editorEvaluateVoters} minHeight={80} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <CreateGradientTitle additionalInfo="recommended">
                      what's the best way for players to reach you?
                    </CreateGradientTitle>
                    <div className="w-full md:w-[640px]">
                      <ResizableEditor editor={editorContactDetails} minHeight={80} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {editorSummarize?.isEmpty ? (
                <p className="text-[16px] font-bold text-negative-11">contest summary can't be empty!</p>
              ) : editorEvaluateVoters?.isEmpty ? (
                <p className="text-[16px] font-bold text-negative-11">evaluate voters can't be empty!</p>
              ) : (
                ""
              )}
              <button
                className="bg-gradient-purple self-center md:self-start rounded-[40px] w-80 h-10 text-center text-true-black text-[16px] font-bold hover:opacity-80 transition-opacity duration-300 ease-in-out"
                onClick={onSavePrompt}
              >
                save prompt
              </button>
            </div>
          </>
        )}
      </div>
    </DialogModalV4>
  );
};

export default EditContestPromptModal;
