import React, { FC, ReactNode, useMemo, useRef } from "react";
import { useMasonryColumnCount } from "./useMasonryColumnCount";

interface MasonryContainerProps {
  children: ReactNode;
  isSingleColumn: boolean;
}

const MasonryContainer: FC<MasonryContainerProps> = ({ children, isSingleColumn }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fittedColumnCount = useMasonryColumnCount(containerRef);
  const columnCount = isSingleColumn ? 1 : fittedColumnCount;

  const columns = useMemo(() => {
    if (columnCount === null) return [];
    const cols: ReactNode[][] = Array.from({ length: columnCount }, () => []);
    React.Children.forEach(children, (child, index) => {
      cols[index % columnCount].push(child);
    });
    return cols;
  }, [children, columnCount]);

  return (
    <div ref={containerRef} className="flex gap-3 wide:gap-3.5">
      {columns.map((col, colIndex) => (
        <div key={colIndex} className="flex-1 min-w-0 flex flex-col gap-3 wide:gap-3.5">
          {col}
        </div>
      ))}
    </div>
  );
};

export default MasonryContainer;
