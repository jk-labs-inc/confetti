import { FC } from "react";

interface ContestImageProps {
  imageUrl: string;
}

const ContestImage: FC<ContestImageProps> = ({ imageUrl }) => {
  return (
    <div className="w-16 h-10 rounded-[16px] shadow-file-upload relative overflow-hidden shrink-0">
      <img src={imageUrl} alt="contest" className="w-full h-full object-cover" />
    </div>
  );
};

export default ContestImage;
