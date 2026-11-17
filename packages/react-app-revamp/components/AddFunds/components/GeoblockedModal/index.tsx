import DialogModalV4 from "@components/UI/DialogModalV4";
import Drawer from "@components/UI/Drawer";
import { useState } from "react";
import GeoblockedGuidance from "./components/Guidance";
import { geoblockedModal, useGeoblockedModalStore } from "./store";

const AddFundsGeoblockedModal = () => {
  const surface = useGeoblockedModalStore(state => state.surface);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  if (surface !== "closed" && !hasBeenShown) setHasBeenShown(true);
  if (!hasBeenShown) return null;

  const guidance = <GeoblockedGuidance onDismiss={geoblockedModal.dismiss} />;

  return (
    <>
      <Drawer
        isOpen={surface === "sheet"}
        onClose={geoblockedModal.dismiss}
        isNested
        className="bg-true-black w-full h-auto md:max-w-[550px] m-auto"
      >
        {guidance}
      </Drawer>
      <DialogModalV4
        isOpen={surface === "dialog"}
        onClose={geoblockedModal.dismiss}
        lgWidth="lg:max-w-[528px]"
        layer="top"
      >
        {guidance}
      </DialogModalV4>
    </>
  );
};

export default AddFundsGeoblockedModal;
