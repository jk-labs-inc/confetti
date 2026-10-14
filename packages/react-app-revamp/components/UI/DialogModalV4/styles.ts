export const dialogModalV4BackdropClassName =
  "fixed inset-0 bg-neutral-8/40 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in";

export type DialogModalV4Panel = "default" | "bare";

const dialogModalV4BarePanelClassName =
  "relative my-8 max-w-[calc(100vw-32px)] transition data-closed:scale-95 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in";

export const getDialogModalV4PanelClassName = (
  width: string,
  lgWidth: string,
  panel: DialogModalV4Panel = "default",
) =>
  panel === "bare"
    ? dialogModalV4BarePanelClassName
    : `relative ${width} transform overflow-hidden rounded-t-[40px] border-t border-neutral-9 bg-true-black text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in lg:my-8 ${lgWidth} lg:rounded-[10px] lg:border-none data-closed:lg:translate-y-0 data-closed:lg:scale-95`;
