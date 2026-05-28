import { FC } from "react";

export type ContestImageSize = "default" | "small";

interface ContestImageProps {
  imageUrl: string;
  size?: ContestImageSize;
}

const sizeClasses: Record<ContestImageSize, string> = {
  default: "w-16 h-10 rounded-[16px]",
  small: "w-10 h-[30px] rounded-[8px]",
};

const ContestImage: FC<ContestImageProps> = ({ imageUrl, size = "default" }) => {
  return (
    <div className={`${sizeClasses[size]} relative overflow-hidden shrink-0`}>
      <img src={imageUrl} alt="contest" className="w-full h-full object-cover" />
    </div>
  );
};

export default ContestImage;
