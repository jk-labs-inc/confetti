import {
  IconEditorAnchor,
  IconEditorBold,
  IconEditorImage,
  IconEditorItalic,
  IconEditorListOrdered,
  IconEditorListUnordered,
  IconEditorQuote,
} from "@components/UI/Icons";
import { toastError } from "@components/UI/Toast";
import { useUploadImageStore } from "@hooks/useUploadImage";
import { validateImageUpload } from "lib/image/uploadValidation";
import { Editor } from "@tiptap/react";
import { useRef } from "react";
import { useMediaQuery } from "react-responsive";
import TipTapEditorControlsTextDropdown from "./components/Dropdown";
import styles from "./styles.module.css";

interface TipTapEditorControlsProps {
  editor: Editor | null;
  className?: string;
}

type Level = 1 | 2 | 3 | 4 | 5 | 6;
type ExtendedLevel = 0 | Level;

export const TipTapEditorControls = (props: TipTapEditorControlsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage } = useUploadImageStore(state => state);
  const { editor } = props;
  const isTabletOrDesktop = useMediaQuery({ minWidth: "768px" });

  if (!editor) {
    return null;
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const uploadError = await validateImageUpload(file);
      if (uploadError) {
        toastError({ message: uploadError });
      } else {
        try {
          const imgUrl = await uploadImage(file);

          if (imgUrl) {
            editor.chain().focus().setImage({ src: imgUrl }).run();
          }
        } catch (error) {
          console.error("Failed to upload image:", error);
        }
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleHeadingChange = (selectedValue: string) => {
    const level = parseInt(selectedValue, 10) as ExtendedLevel;
    if (level === 0) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  return (
    <div className={`inline-flex flex-wrap sm:gap-2 items-center ${props.className}`}>
      <TipTapEditorControlsTextDropdown onSelectionChange={handleHeadingChange} />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`${styles.control} ${editor.isActive("bold") ? styles["control--active"] : ""} `}
      >
        <IconEditorBold color="#" />
        <span className="sr-only">Toggle bold text formatting</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`${styles.control} ${editor.isActive("italic") ? styles["control--active"] : ""}`}
      >
        <IconEditorItalic />
        <span className="sr-only">Toggle italic text formatting</span>
      </button>
      <button
        type="button"
        className={`${styles.control} ${editor.isActive("link") ? styles["control--active"] : ""}`}
        onClick={() => {
          const previousUrl = editor.getAttributes("link").href;
          const url = window.prompt(previousUrl ? "Change Link URL" : "Paste link URL", previousUrl);

          // cancelled
          if (url === null) return;

          // empty
          if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }

          // update link
          editor.chain().focus().extendMarkRange("link").setLink({ href: url, target: "_blank" }).run();
        }}
        title="Link"
      >
        <IconEditorAnchor />
        <span className="sr-only">Add link from selected text</span>
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`${styles.control} ${editor.isActive("bulletList") ? styles["control--active"] : ""}`}
      >
        <IconEditorListUnordered />
        <span className="sr-only">Toggle bullet list text formatting</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`${styles.control} ${editor.isActive("orderedList") ? styles["control--active"] : ""}`}
      >
        <IconEditorListOrdered />
        <span className="sr-only">Toggle ordered list text formatting</span>
      </button>
      {isTabletOrDesktop && (
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`${styles.control} ${editor.isActive("blockquote") ? styles["control--active"] : ""}`}
        >
          <IconEditorQuote />
          <span className="sr-only">Toggle blockquote text formatting</span>
        </button>
      )}

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

      <button
        type="button"
        className={`${styles.control} ${editor.isActive("image") ? styles["control--active"] : ""}`}
        onClick={() => fileInputRef.current?.click()}
      >
        <IconEditorImage />
        <span className="sr-only">Add an image</span>
      </button>
      {isTabletOrDesktop && (
        <button
          type="button"
          className={`${styles.text} ${styles.control}`}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <span className="text-2xs">Divider</span>
          <span className="sr-only">Add a divider</span>
        </button>
      )}
    </div>
  );
};

export default TipTapEditorControls;
