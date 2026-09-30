import { FC, ReactNode } from "react";

interface RoomHeaderProps {
  action?: ReactNode;
}

const RoomHeader: FC<RoomHeaderProps> = ({ action }) => (
  <div className="flex shrink-0 items-center justify-between gap-2">
    <h2 className="text-[15px] wide:text-[16px] font-black text-neutral-11">leaderboard</h2>
    {action}
  </div>
);

export default RoomHeader;
