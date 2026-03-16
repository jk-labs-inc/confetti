import DialogModalV4 from "@components/UI/DialogModalV4";
import ImageUpload from "@components/UI/ImageUpload";
import { FC, useEffect, useState } from "react";

interface EditContestImageModalProps {
  contestImageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageUrl: string) => void;
}

const EditContestImageModal: FC<EditContestImageModalProps> = ({ contestImageUrl, isOpen, onClose, onSave }) => {
  const [imageValue, setImageValue] = useState(contestImageUrl);

  useEffect(() => {
    setImageValue(contestImageUrl);
  }, [contestImageUrl]);

  const handleImageLoad = (imageUrl: string) => {
    setImageValue(imageUrl);
  };

  const handleSave = () => {
    if (!imageValue) return;

    onSave(imageValue);
    onClose();
  };

  return (
    <DialogModalV4 isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-14 py-6 md:py-16 pl-8 md:pl-32 pr-4 md:pr-16">
        <div className="flex justify-between items-center">
          <p className="text-[24px] text-neutral-11 font-bold">edit previewimage.png image</p>
          <img
            src="/modal/modal_close.svg"
            width={39}
            height={33}
            alt="close"
            className="hidden md:block cursor-pointer"
            onClick={onClose}
          />
        </div>

        <ImageUpload initialImageUrl={imageValue} onImageLoad={handleImageLoad} />

        <button
          className="bg-gradient-purple self-center md:self-start rounded-[40px] w-80 h-10 text-center text-true-black text-[16px] font-bold hover:opacity-80 transition-opacity duration-300 ease-in-out"
          onClick={handleSave}
        >
          save
        </button>
      </div>
    </DialogModalV4>
  );
};

export default EditContestImageModal;
