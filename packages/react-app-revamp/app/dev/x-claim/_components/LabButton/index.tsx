import { FC, ReactNode } from "react";

interface LabButtonProps {
  onClick: () => void;
  children: ReactNode;
}

const LabButton: FC<LabButtonProps> = ({ onClick, children }) => (
  <button className="rounded bg-neutral-17 px-3 py-2 text-left text-neutral-11 hover:bg-neutral-3" onClick={onClick}>
    {children}
  </button>
);

export default LabButton;
