import { useModal } from "@getpara/react-sdk-lite";
import InfoPanel from "../../InfoPanel";

const RewardsPlayerViewNotConnected = () => {
  const { openModal } = useModal();

  return (
    <InfoPanel
      title="my rewards"
      image="/rewards/wallet-not-connected.png"
      imageAlt="wallet not connected"
      heading="let's sign in"
      description={
        <p className="text-[16px] text-neutral-11">
          wallets let you track what you earn. <br />
          don't have one? we'll help you make one.
        </p>
      }
      actionButton={{
        text: "sign in",
        onClick: () => openModal(),
      }}
    />
  );
};

export default RewardsPlayerViewNotConnected;
