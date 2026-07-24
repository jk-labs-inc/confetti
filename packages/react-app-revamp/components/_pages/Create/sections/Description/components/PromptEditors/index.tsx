import CreateGradientTitle from "@components/_pages/Create/components/GradientTitle";
import ResizableEditor from "@components/UI/ResizableEditor";
import TipTapEditorControls from "@components/UI/TipTapEditorControls";
import { createEditorConfig } from "@helpers/createEditorConfig";
import { useDeployContestStore } from "@hooks/useDeployContest/store";
import { Editor, useEditor } from "@tiptap/react";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";

const CreateContestPromptEditors = () => {
  const { prompt, setPrompt } = useDeployContestStore(
    useShallow(state => ({
      prompt: state.prompt,
      setPrompt: state.setPrompt,
    })),
  );
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const editorSummarize = useEditor({
    ...createEditorConfig({
      content: prompt.summarize,
      placeholderText: isMobile
        ? "core team will pick best feature idea"
        : "our core team will vote on $1000 for best feature proposal",
      onUpdate: ({ editor }: { editor: Editor }) => {
        const content = editor.getHTML();

        if (editor.isEmpty) {
          setPrompt({
            ...prompt,
            summarize: "",
          });
        } else {
          setPrompt({
            ...prompt,
            summarize: content,
          });
        }
      },
    }),
    onFocus: () => setActiveEditor(editorSummarize),
    immediatelyRender: false,
  });

  const editorEvaluateVoters = useEditor({
    ...createEditorConfig({
      content: prompt.evaluateVoters,
      placeholderText: isMobile
        ? "pick which will bring the most users"
        : "voters should vote on the feature that will bring the most users",
      onUpdate: ({ editor }: { editor: Editor }) => {
        const content = editor.getHTML();

        if (editor.isEmpty) {
          setPrompt({
            ...prompt,
            evaluateVoters: "",
          });
        } else {
          setPrompt({
            ...prompt,
            evaluateVoters: content,
          });
        }
      },
    }),
    onFocus: () => setActiveEditor(editorEvaluateVoters),
    immediatelyRender: false,
  });

  const editorContactDetails = useEditor({
    ...createEditorConfig({
      content: prompt.contactDetails ?? "",
      placeholderText: isMobile
        ? "i'm on telegram: @me"
        : "we have a telegram group for everyone to coordinate at tgexample.com",
      onUpdate: ({ editor }: { editor: Editor }) => {
        const content = editor.getHTML();

        setPrompt({
          ...prompt,
          contactDetails: content,
        });
      },
    }),
    onFocus: () => setActiveEditor(editorContactDetails),
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editorSummarize || editorSummarize.isFocused) return;
    if (editorSummarize.getHTML() === prompt.summarize) return;

    editorSummarize.commands.setContent(prompt.summarize || "", { emitUpdate: false });
  }, [prompt.summarize, editorSummarize]);

  return (
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
  );
};

export default CreateContestPromptEditors;
