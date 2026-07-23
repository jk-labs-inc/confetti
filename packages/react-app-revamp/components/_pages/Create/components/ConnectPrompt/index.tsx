import { ButtonSize } from "@components/UI/ButtonV3";
import ButtonV3 from "@components/UI/ButtonV3";
import { useModal } from "@getpara/react-sdk-lite";

const CreateConnectPrompt = () => {
  const { openModal } = useModal();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <p className="text-[16px] text-neutral-11">
          to proceed, you need to sign in and pick which chain <br /> you want the contest on.
        </p>
        <p className="text-[16px] text-neutral-11">this way, you can price charges in the native token of the chain.</p>
      </div>
      <ButtonV3
        colorClass={`text-[16px] bg-gradient-create rounded-[10px] font-bold  text-true-black hover:scale-105 transition-transform duration-200 ease-in-out`}
        size={ButtonSize.LARGE}
        onClick={() => openModal()}
        isDisabled={false}
      >
        sign in
      </ButtonV3>
    </div>
  );
};

export default CreateConnectPrompt;
