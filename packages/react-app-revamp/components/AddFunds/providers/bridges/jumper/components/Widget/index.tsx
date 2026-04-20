import { useModal } from "@getpara/react-sdk-lite";
import { LiFiWidget, useWidgetEvents, WidgetEvent } from "@lifi/widget";
import { FC, useEffect } from "react";
import { createJumperWidgetConfig } from "./config";

interface AddFundsJumperWidgetProps {
  chainId: number;
  asset: string;
  onBridgeSuccess?: () => void;
}

const BRIDGE_SUCCESS_REDIRECT_DELAY_MS = 1500;

const AddFundsJumperWidget: FC<AddFundsJumperWidgetProps> = ({ chainId, asset, onBridgeSuccess }) => {
  const { openModal } = useModal();
  const widgetEvents = useWidgetEvents();
  const widgetConfig = createJumperWidgetConfig(chainId, asset, () => openModal());

  useEffect(() => {
    if (!onBridgeSuccess) return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const handleRouteCompleted = () => {
      timeoutId = setTimeout(onBridgeSuccess, BRIDGE_SUCCESS_REDIRECT_DELAY_MS);
    };

    widgetEvents.on(WidgetEvent.RouteExecutionCompleted, handleRouteCompleted);

    return () => {
      widgetEvents.off(WidgetEvent.RouteExecutionCompleted, handleRouteCompleted);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [widgetEvents, onBridgeSuccess]);

  return (
    <div className="w-full max-w-full overflow-hidden">
      <LiFiWidget integrator="Confetti" config={widgetConfig} />
    </div>
  );
};

export default AddFundsJumperWidget;
