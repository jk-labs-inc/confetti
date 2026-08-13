import { navigationRoutes, useWidgetEvents, WidgetEvent } from "@lifi/widget";
import { FC, RefObject, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getJumperBridgeUrl } from "../../utils";

interface AddFundsJumperSourceChainNoticeProps {
  containerRef: RefObject<HTMLDivElement | null>;
  chainId: number;
  asset: string;
}

const SOURCE_SELECTION_ROUTE = `/${navigationRoutes.fromToken}`;
const WIDGET_LIST_CLASS_NAME = "long-list";
const PINNED_PLACEMENT = "pinned";

interface InjectedNotice {
  host: HTMLElement;
  scrollBox: HTMLElement;
}

type NoticePlacement = InjectedNotice | typeof PINNED_PLACEMENT | null;

const injectNoticeHost = (container: HTMLElement): InjectedNotice | null => {
  const list = container.querySelector(`.${WIDGET_LIST_CLASS_NAME}`);
  const scrollBox = list?.parentElement;
  const header = scrollBox?.previousElementSibling;

  if (!(header instanceof HTMLElement) || !(scrollBox instanceof HTMLElement)) return null;

  const host = document.createElement("div");
  header.insertBefore(host, header.childElementCount > 1 ? header.lastElementChild : null);

  return { host, scrollBox };
};

const AddFundsJumperSourceChainNotice: FC<AddFundsJumperSourceChainNoticeProps> = ({ containerRef, chainId, asset }) => {
  const widgetEvents = useWidgetEvents();
  const [sourcePage, setSourcePage] = useState<string>("");
  const [placement, setPlacement] = useState<NoticePlacement>(null);

  useEffect(() => {
    const handlePageEntered = (page: string) => {
      setSourcePage(page.startsWith(SOURCE_SELECTION_ROUTE) ? page : "");
    };

    widgetEvents.on(WidgetEvent.PageEntered, handlePageEntered);

    return () => {
      widgetEvents.off(WidgetEvent.PageEntered, handlePageEntered);
    };
  }, [widgetEvents]);

  useEffect(() => {
    const container = containerRef.current;

    if (!sourcePage || !container) return;

    const injected = injectNoticeHost(container);
    setPlacement(injected ?? PINNED_PLACEMENT);

    return () => {
      injected?.host.remove();
      setPlacement(null);
    };
  }, [sourcePage, containerRef]);

  useLayoutEffect(() => {
    if (!placement || placement === PINNED_PLACEMENT) return;

    const { host, scrollBox } = placement;
    const noticeHeight = host.offsetHeight;

    if (!noticeHeight) return;

    scrollBox.style.height = `${scrollBox.offsetHeight - noticeHeight}px`;
  }, [placement]);

  if (!placement) return null;

  const notice = (
    <p className="text-neutral-9 text-[14px]">
      don't see your chain?{" "}
      <a
        href={getJumperBridgeUrl(chainId, asset)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-positive-11 hover:text-positive-10"
      >
        try jumper directly here
      </a>
    </p>
  );

  if (placement === PINNED_PLACEMENT) {
    return (
      <div className="absolute inset-x-0 bottom-0 z-10 bg-true-black border-t border-neutral-3 px-6 py-3">{notice}</div>
    );
  }

  return createPortal(<div className="pt-3">{notice}</div>, placement.host);
};

export default AddFundsJumperSourceChainNotice;
