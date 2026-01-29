import ButtonV3, { ButtonSize } from "@components/UI/ButtonV3";
import { FC, useState } from "react";

interface AddToHomeScreenNotSupportedBrowserProps {
  onClose?: () => void;
}

const AddToHomeScreenNotSupportedBrowser: FC<AddToHomeScreenNotSupportedBrowserProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  return (
    <>
      {step === 1 ? (
        <div className="flex flex-col gap-6">
          <p className="text-[24px] font-bold">please change browser</p>
          <div className="flex flex-col gap-2">
            <p className="text-[16px]">to install Confetti as an app, you’ll need to add it to your home screen.</p>
            <p className="text-[16px]">please open it in a supported browser like safari or chrome to install.</p>
          </div>
          <div className="flex flex-col gap-4">
            <ButtonV3 colorClass="bg-gradient-vote rounded-[40px]" size={ButtonSize.FULL} onClick={() => setStep(2)}>
              i’ll change my browser now
            </ButtonV3>
            <p className="text-[12px] text-center cursor-pointer" onClick={onClose}>
              i prefer to use this browser for now
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <p className="text-[24px] font-bold">great! here’s what’s next:</p>
          </div>
          <div className="markdown pl-1">
            <ol className="flex flex-col gap-3">
              <li className="text-[16px]">
                open confetti.win in safari <i>or</i> chrome
              </li>
              <li className="text-[16px]">
                tap the <b>share icon</b>
              </li>
              <li className="text-[16px]">
                tap <b>add to home screen</b>
              </li>
            </ol>
          </div>
          <p className="text-[16px]">
            and you’re set! see you soon in your other browser, where we’ll give these instructions again :)
          </p>
        </div>
      )}
    </>
  );
};

export default AddToHomeScreenNotSupportedBrowser;
