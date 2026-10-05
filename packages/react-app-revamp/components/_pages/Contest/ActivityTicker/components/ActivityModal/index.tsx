import DialogModalV4 from "@components/UI/DialogModalV4";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { FC } from "react";
import ActivityList from "../../../MarketRail/components/ActivityList";
import { ACTIVITY_MODAL_LIST_MAX_HEIGHT_PX } from "../../constants";

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ActivityModal: FC<ActivityModalProps> = ({ isOpen, onClose }) => {
  const isVotingOpen = useContestStatusStore(state => state.contestStatus) === ContestStatus.VotingOpen;

  return (
    <DialogModalV4 isOpen={isOpen} onClose={() => onClose()} lgWidth="lg:max-w-[520px]">
      <div className="no-scrollbar flex max-h-[calc(100dvh-4rem)] flex-col gap-4 overflow-y-auto p-4 text-left lg:max-h-[calc(100dvh-7rem)] lg:p-0 lg:pb-6">
        <div className="flex items-center gap-3">
          <h2 className="font-sabo-filled text-[28px] leading-none normal-case text-neutral-11">activity</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="close"
            className="ml-auto shrink-0 transition-transform hover:scale-[1.1]"
          >
            <img src="/modal/modal_close.svg" width={24} height={24} alt="" draggable={false} />
          </button>
        </div>
        <p className="text-[12px] text-neutral-9">every vote, newest first{isVotingOpen ? " · updates live" : ""}</p>
        <div className="flex min-h-0 flex-col" style={{ maxHeight: ACTIVITY_MODAL_LIST_MAX_HEIGHT_PX }}>
          <ActivityList />
        </div>
      </div>
    </DialogModalV4>
  );
};

export default ActivityModal;
