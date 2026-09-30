import { FC } from "react";
import {
  CHIP_AVATAR_CLASS_NAME,
  CHIP_AVATAR_STACKED_CLASS_NAME,
  CHIP_CLASS_NAME,
  CHIP_LABEL_CLASS_NAME,
  CHIP_MAX_FACES,
  CHIP_PLACEHOLDER_LABEL,
} from "../constants";

interface EntryVotersChipPlaceholderProps {
  className?: string;
}

const EntryVotersChipPlaceholder: FC<EntryVotersChipPlaceholderProps> = ({ className = "" }) => (
  <span aria-hidden className={`${CHIP_CLASS_NAME} invisible ${className}`}>
    <span className="flex items-center">
      {Array.from({ length: CHIP_MAX_FACES }, (_, index) => (
        <span
          key={index}
          className={`rounded-full ${CHIP_AVATAR_CLASS_NAME} ${index > 0 ? CHIP_AVATAR_STACKED_CLASS_NAME : ""}`}
        />
      ))}
    </span>
    <span className={CHIP_LABEL_CLASS_NAME}>{CHIP_PLACEHOLDER_LABEL}</span>
  </span>
);

export default EntryVotersChipPlaceholder;
