import HowItWorksSteps from "@components/HowItWorksExplainer/Steps";
import { useHowItWorksStore } from "@components/HowItWorksExplainer/store";
import DialogModalV4 from "@components/UI/DialogModalV4";
import Drawer from "@components/UI/Drawer";
import { DESKTOP_HEADER_MIN_WIDTH_PX } from "@helpers/isMobileViewport";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";

const HowItWorksFrame = () => {
  const { isOpen, openCount, close } = useHowItWorksStore(
    useShallow(state => ({ isOpen: state.isOpen, openCount: state.openCount, close: state.close })),
  );
  const isModal = useMediaQuery({ minWidth: DESKTOP_HEADER_MIN_WIDTH_PX });
  const steps = <HowItWorksSteps key={openCount} isOpen={isOpen} onClose={close} />;

  if (isModal) {
    return (
      <DialogModalV4 isOpen={isOpen} onClose={close} lgWidth="lg:max-w-[480px]">
        {steps}
      </DialogModalV4>
    );
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={close}
      handleSize="compact"
      className="bg-true-black w-full h-auto border-neutral-9! border-x-0! md:max-w-[550px] m-auto"
    >
      {steps}
    </Drawer>
  );
};

export default HowItWorksFrame;
