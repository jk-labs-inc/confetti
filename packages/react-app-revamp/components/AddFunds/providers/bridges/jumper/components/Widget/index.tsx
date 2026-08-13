import { useModal } from "@getpara/react-sdk-lite";
import { LiFiWidget, useWidgetEvents, WidgetEvent } from "@lifi/widget";
import { FC, useEffect, useMemo, useRef } from "react";
import AddFundsJumperSourceChainNotice from "../SourceChainNotice";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const openModalRef = useRef(openModal);

  useEffect(() => {
    openModalRef.current = openModal;
  }, [openModal]);

  const widgetConfig = useMemo(
    () => createJumperWidgetConfig(chainId, asset, () => openModalRef.current()),
    [chainId, asset],
  );
  const widget = useMemo(() => <LiFiWidget integrator="Confetti" config={widgetConfig} />, [widgetConfig]);

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
    <div ref={containerRef} className="relative w-full max-w-full overflow-hidden">
      {widget}
      <AddFundsJumperSourceChainNotice containerRef={containerRef} chainId={chainId} asset={asset} />
    </div>
  );
};

export default AddFundsJumperWidget;
