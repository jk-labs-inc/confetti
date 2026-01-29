import ButtonV3, { ButtonSize } from "@components/UI/ButtonV3";
import { FC, useState } from "react";

interface AddToHomeScreenSupportedBrowserProps {
  onClose?: () => void;
}

const AddToHomeScreenSupportedBrowser: FC<AddToHomeScreenSupportedBrowserProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);

  return (
    <>
      {step === 1 ? (
        <div className="flex flex-col gap-6">
          <p className="text-[24px] font-bold">add to home screen</p>
          <p className="text-[16px]">
            <span className="normal-case">Confetti</span> is meant to be used as an app. <br />
            just tap share and “add to home screen.”
          </p>
          <div className="flex flex-col gap-4 mt-14">
            <ButtonV3 colorClass="bg-gradient-vote rounded-[40px]" size={ButtonSize.FULL} onClick={() => setStep(2)}>
              show me detailed instructions
            </ButtonV3>
            <p className="text-[12px] text-center cursor-pointer" onClick={onClose}>
              i prefer to use this browser for now
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <p className="text-[24px] font-bold">add to home screen</p>
          <p className="text-[16px]">
            <span className="normal-case">Confetti</span> is meant to be used as an app. <br />
            to install, just follow the steps below:
          </p>
          <div className="markdown pl-1">
            <ol className="flex flex-col gap-3">
              <li className="text-[16px]">
                tap the <b>share icon</b>
              </li>
              <li className="text-[16px]">
                tap <b>add to home screen</b>
              </li>
              <li className="text-[16px]">
                open <span className="normal-case">Confetti</span> from homescreen
              </li>
            </ol>
          </div>
          <p className="text-[16px]">and that’s it!</p>
        </div>
      )}
    </>
  );
};

export default AddToHomeScreenSupportedBrowser;
