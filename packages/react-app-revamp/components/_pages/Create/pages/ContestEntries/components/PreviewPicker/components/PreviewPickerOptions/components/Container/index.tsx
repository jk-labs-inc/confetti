import { FC, ReactNode } from "react";
import { motion } from "motion/react";

interface CreateContestEntriesPreviewPickerOptionsContainerProps {
  title: string;
  isActive: boolean;
  children: ReactNode;
  onClick?: () => void;
}

const CreateContestEntriesPreviewPickerOptionsContainer: FC<CreateContestEntriesPreviewPickerOptionsContainerProps> = ({
  title,
  isActive,
  children,
  onClick,
}) => {
  return (
    <motion.div
      onClick={onClick}
      animate={{
        borderColor: isActive ? "rgb(250, 250, 250)" : "rgb(64, 64, 64)", // neutral-11 : neutral-10
      }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={`flex flex-col w-40 md:w-[400px] h-[140px] md:h-[320px] gap-1.5 md:gap-4 p-2 md:p-4 rounded-xl md:rounded-2xl bg-true-black border cursor-pointer ${
        isActive ? "border-neutral-11" : "border-neutral-10"
      }`}
    >
      <motion.p
        animate={{
          color: isActive ? "rgb(250, 250, 250)" : "rgb(64, 64, 64)", // neutral-11 : neutral-10
          fontWeight: isActive ? 700 : 400,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="text-base md:text-[20px] text-center"
      >
        {title}
      </motion.p>
      <div className="flex-1 min-h-0 w-full flex items-start justify-center">{children}</div>
    </motion.div>
  );
};

export default CreateContestEntriesPreviewPickerOptionsContainer;
