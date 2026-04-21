import ButtonV3, { ButtonSize } from "@components/UI/ButtonV3";
import { usePreviousStep } from "@components/_pages/Create/hooks/usePreviousStep";
import { FC, MouseEventHandler } from "react";
import { useMediaQuery } from "react-responsive";
import MobileBottomButton from "../Mobile";

interface CreateNextButtonProps {
  step: number;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  isDisabled?: boolean;
  id?: string;
}

const CreateNextButton: FC<CreateNextButtonProps> = ({ step, onClick, isDisabled, id }) => {
  const onPreviousStep = usePreviousStep();
  const isMobileOrTablet = useMediaQuery({ maxWidth: 1024 });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
    }
  };

  const onBackHandler = () => {
    onPreviousStep();
  };

  if (isMobileOrTablet)
    return (
      <MobileBottomButton>
        <div
          className={`flex flex-row items-center h-12 justify-between border-t-neutral-2 border-t-2   px-8 ${
            step === 1 ? "justify-end" : ""
          }`}
        >
          {step !== 1 && (
            <p className="text-[20px] text-neutral-11" onClick={onBackHandler}>
              back
            </p>
          )}
          <ButtonV3
            id={id}
            isDisabled={isDisabled}
            onClick={handleClick}
            colorClass="text-[20px] bg-gradient-purple rounded-[15px] font-bold text-true-black hover:scale-105 transition-transform duration-200 ease-in-out"
          >
            next
          </ButtonV3>
        </div>
      </MobileBottomButton>
    );

  return (
    <div className="flex gap-4 items-start mb-5">
      <div className={`flex flex-col gap-4 items-center`}>
        <ButtonV3
          id={id}
          colorClass="text-[20px] bg-gradient-purple rounded-[10px] font-bold text-true-black hover:scale-105 transition-transform duration-200 ease-in-out"
          size={ButtonSize.LARGE}
          onClick={handleClick}
          isDisabled={isDisabled}
        >
          next
        </ButtonV3>
        {step !== 1 && (
          <button
            className="hidden lg:flex items-center gap-[5px] -ml-[15px] cursor-pointer group"
            onClick={onBackHandler}
          >
            <div className="transition-transform duration-200 group-hover:-translate-x-1">
              <img src="/create-flow/back.svg" alt="back" width={15} height={15} className="mt-px" />
            </div>
            <p className="text-[16px]">back</p>
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateNextButton;
