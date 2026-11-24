import { Editor } from "@tiptap/react";
import { useEffect } from "react";

export const useSyncEditorContent = (editor: Editor | null, content: string) => {
  useEffect(() => {
    if (!editor) return;

    const isInSync = content ? editor.getHTML() === content : editor.isEmpty;
    if (isInSync) return;

    editor.commands.setContent(content, { emitUpdate: false });
  }, [content, editor]);
};
