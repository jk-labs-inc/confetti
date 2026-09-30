import MarketPanel from "@components/_pages/Contest/MarketPanel";
import { FC } from "react";
import ContestEntriesColumn from "../ContestEntriesColumn";

const ContestTabletLayout: FC = () => (
  <div className="mt-3 flex flex-col gap-3 min-w-0">
    <MarketPanel />
    <ContestEntriesColumn scrollMode="page" />
  </div>
);

export default ContestTabletLayout;
