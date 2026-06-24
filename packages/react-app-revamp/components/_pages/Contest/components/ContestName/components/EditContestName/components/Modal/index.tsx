import { CONTEST_TITLE_MAX_LENGTH } from "@components/_pages/Create/constants/length";
import DialogModalV4 from "@components/UI/DialogModalV4";
import ImageUpload from "@components/UI/ImageUpload";
import { FC, useEffect, useState } from "react";
import EditContestNameTextInput from "../TextInput";

interface EditContestNameModalProps {
  contestName: string;
  contestImageUrl?: string;
  isOpen: boolean;
  setIsCloseModal: (isOpen: boolean) => void;
  handleEditContestName?: (value: string) => void | Promise<void>;
  onImageSave?: (imageUrl: string) => void | Promise<void>;
}

const EditContestNameModal: FC<EditContestNameModalProps> = ({
  contestName,
  contestImageUrl,
  isOpen,
  setIsCloseModal,
  handleEditContestName,
  onImageSave,
}) => {
  const [inputValue, setInputValue] = useState(contestName);
  const [imageValue, setImageValue] = useState(contestImageUrl ?? "");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setInputValue(contestName);
  }, [contestName]);

  useEffect(() => {
    setImageValue(contestImageUrl ?? "");
  }, [contestImageUrl]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (!value.trim()) {
      setError("title cannot be empty");
    } else if (value.length >= CONTEST_TITLE_MAX_LENGTH) {
      setError(`title must not exceed ${CONTEST_TITLE_MAX_LENGTH} characters`);
    } else {
      setError("");
    }
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (!value.trim()) {
      setError("title cannot be empty");
    } else if (value.length >= CONTEST_TITLE_MAX_LENGTH) {
      setError(`title must not exceed ${CONTEST_TITLE_MAX_LENGTH} characters`);
    } else {
      setError("");
    }
  };

  const handleSaveClick = async (value: string) => {
    if (!value.trim()) {
      setError("title cannot be empty");
      return;
    }
    if (value.length >= CONTEST_TITLE_MAX_LENGTH) {
      setError(`title must not exceed ${CONTEST_TITLE_MAX_LENGTH} characters`);
      return;
    }

    // Run the writes sequentially so two contract writes never race on the same nonce.
    if (value !== contestName) {
      await handleEditContestName?.(value);
    }

    if (imageValue && imageValue !== contestImageUrl && onImageSave) {
      await onImageSave(imageValue);
    }

    setIsCloseModal(false);
  };

  const onModalClose = () => {
    setIsCloseModal(false);
  };

  return (
    <DialogModalV4 isOpen={isOpen} onClose={onModalClose} lgWidth="lg:max-w-[600px]">
      <div className="flex flex-col gap-8 py-6 md:py-8 px-6 md:px-10">
        <div className="flex justify-end items-center">
          <img
            src="/modal/modal_close.svg"
            width={28}
            height={24}
            alt="close"
            className="hidden md:block cursor-pointer"
            onClick={() => setIsCloseModal(false)}
          />
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-[20px] text-neutral-11 font-bold">
            {contestImageUrl ? "edit preview image" : "add preview image"}
          </p>
          <ImageUpload initialImageUrl={contestImageUrl} onImageLoad={setImageValue} />
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-[20px] text-neutral-11 font-bold">edit title</p>
          <div className="bg-secondary-1 w-full rounded-[16px] outline-none p-4">
            <EditContestNameTextInput
              value={inputValue}
              handleTextAreaChange={handleTextAreaChange}
              handleInputChange={handleInputChange}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {error && <p className="text-[14px] text-negative-11 font-bold">{error}</p>}
          <button
            className="bg-gradient-purple self-center md:self-start rounded-[40px] w-64 h-10 text-center text-true-black text-[16px] font-bold hover:opacity-80 transition-opacity duration-300 ease-in-out"
            onClick={() => handleSaveClick(inputValue)}
          >
            save
          </button>
        </div>
      </div>
    </DialogModalV4>
  );
};

export default EditContestNameModal;
