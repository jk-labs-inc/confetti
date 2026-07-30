import { useModal } from "@getpara/react-sdk-lite";

const ConnectRow = () => {
  const { openModal } = useModal();

  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={() => openModal()}
        className="px-2 rounded-[10px] border border-positive-11 hover:border-2 cursor-pointer"
      >
        <p className="text-[12px] text-positive-11 uppercase">sign in</p>
      </button>
      <p className="text-[16px] text-neutral-14 font-bold">to see your balance</p>
    </div>
  );
};

export default ConnectRow;
