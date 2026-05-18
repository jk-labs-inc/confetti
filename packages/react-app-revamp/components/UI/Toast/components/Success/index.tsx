import { FC } from "react";

interface SuccessToastProps {
  message: string;
  id?: string;
  dataAttributes?: Record<string, string | number>;
}

const SuccessToast: FC<SuccessToastProps> = ({ message, id, dataAttributes }) => (
  <div id={id} {...dataAttributes} className="flex gap-4 items-center pl-4">
    <img src="/toast/success.svg" width={40} height={40} alt="success" />
    <div className="flex flex-col">
      <p className="uppercase font-bold text-[16px]">Success!</p>
      <p className="text-[12px]">{message}</p>
    </div>
  </div>
);

export default SuccessToast;
