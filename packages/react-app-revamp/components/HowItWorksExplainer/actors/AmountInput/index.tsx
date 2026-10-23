import { FC } from "react";

interface AmountInputProps {
  value: string;
}

const AmountInput: FC<AmountInputProps> = ({ value }) => (
  <div className="flex h-12 w-full items-center rounded-[40px] border border-neutral-5 bg-neutral-2 px-5 text-[24px] font-bold text-neutral-11">
    <span className="mr-1 text-neutral-9">$</span>
    {value}
  </div>
);

export default AmountInput;
