import {
  arrow,
  autoUpdate,
  flip,
  offset,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
  useTransitionStyles,
  type Placement,
} from "@floating-ui/react";
import { useRef, useState } from "react";

export type TooltipSurface = "default" | "dark" | "panel";

interface UseTooltipOptions {
  interactive?: boolean;
  placement?: Placement;
  offsetPx?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  openDelay?: number;
  closeDelay?: number;
  requireIntent?: boolean;
  enableClick?: boolean;
  strategy?: "fixed" | "absolute";
}

export function useTooltip({
  interactive = false,
  placement = "top",
  offsetPx = 8,
  open: controlledOpen,
  onOpenChange,
  openDelay = 200,
  closeDelay,
  requireIntent = false,
  enableClick = false,
  strategy = "fixed",
}: UseTooltipOptions = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;

  const setOpen = (next: boolean) => {
    onOpenChange?.(next);
    if (controlledOpen === undefined) setUncontrolledOpen(next);
  };

  const arrowRef = useRef<SVGSVGElement>(null);

  const {
    refs,
    context,
    floatingStyles,
    placement: resolvedPlacement,
  } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    strategy,
    whileElementsMounted: autoUpdate,
    middleware: [offset(offsetPx), flip(), shift({ padding: 8 }), arrow({ element: arrowRef })],
  });

  const hover = useHover(context, {
    move: false,
    delay: { open: openDelay, close: closeDelay ?? (interactive ? 0 : 150) },
    handleClose: interactive ? safePolygon({ requireIntent, buffer: 1 }) : null,
  });
  const focus = useFocus(context);
  const click = useClick(context, { enabled: enableClick });
  const dismiss = useDismiss(context, { ancestorScroll: true });
  const role = useRole(context, { role: interactive ? "dialog" : "tooltip" });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, click, dismiss, role]);

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: { open: 180, close: 130 },
    initial: { opacity: 0, transform: "scale(0.96)" },
    common: ({ side }) => ({
      transformOrigin: side === "top" ? "bottom" : side === "bottom" ? "top" : side === "left" ? "right" : "left",
      transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    }),
  });

  return {
    open,
    isMounted,
    interactive,
    refs,
    context,
    floatingStyles,
    transitionStyles,
    arrowRef,
    placement: resolvedPlacement,
    getReferenceProps,
    getFloatingProps,
  };
}

export type UseTooltipReturn = ReturnType<typeof useTooltip>;
