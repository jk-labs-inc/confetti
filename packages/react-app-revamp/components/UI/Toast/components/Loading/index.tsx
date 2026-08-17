import MotionSpinner from "@components/UI/MotionSpinner";
import { FC } from "react";

export enum LoadingToastMessageType {
  WALLET_SIGNATURE = "walletSignature",
  KEEP_BROWSER_OPEN = "keepBrowserOpen",
  NONE = "none",
}

interface LoadingToastProps {
  message: string;
  id?: string;
  additionalMessageType?: LoadingToastMessageType;
}

const LoadingToast: FC<LoadingToastProps> = ({ message, id, additionalMessageType = LoadingToastMessageType.NONE }) => {
  const getAdditionalMessage = () => {
    switch (additionalMessageType) {
      case LoadingToastMessageType.WALLET_SIGNATURE:
        return "check wallet to sign all transactions";
      case LoadingToastMessageType.KEEP_BROWSER_OPEN:
        return "please don't close browser until confirmation appears";
      default:
        return null;
    }
  };

  return (
    <div id={id} className="flex gap-4 items-center pl-4">
      <MotionSpinner theme="dark" size={32} />
      <div className="flex flex-col">
        <p className="font-bold text-[14px]">{message}</p>
        {additionalMessageType !== LoadingToastMessageType.NONE && (
          <p className="text-[12px]">{getAdditionalMessage()}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingToast;
