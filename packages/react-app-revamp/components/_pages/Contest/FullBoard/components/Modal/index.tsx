import DialogModalV4 from "@components/UI/DialogModalV4";
import { FC } from "react";
import FullBoard from "../..";

interface FullBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FullBoardModal: FC<FullBoardModalProps> = ({ isOpen, onClose }) => (
  <DialogModalV4 isOpen={isOpen} onClose={() => onClose()} lgWidth="lg:max-w-[760px]">
    <div className="no-scrollbar flex max-h-[calc(100dvh-4rem)] flex-col gap-4 overflow-y-auto p-4 text-left lg:max-h-[calc(100dvh-7rem)] lg:p-0 lg:pb-6">
      <div className="flex items-center gap-3">
        <h2 className="font-sabo-filled text-[28px] leading-none normal-case text-neutral-11">leaderboard</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="close"
          className="ml-auto shrink-0 transition-transform hover:scale-[1.1]"
        >
          <img src="/modal/modal_close.svg" width={24} height={24} alt="" draggable={false} />
        </button>
      </div>
      <FullBoard />
    </div>
  </DialogModalV4>
);

export default FullBoardModal;
