const ADD_FUNDS_MODAL_ID = "add_funds_modal";
const MARKER_STYLE =
  "position:fixed;bottom:0;left:0;width:1px;height:1px;background:transparent;pointer-events:none;";

let marker: HTMLElement | null = null;

export const showAddFundsMarker = () => {
  if (marker) return;
  marker = document.createElement("div");
  marker.id = ADD_FUNDS_MODAL_ID;
  marker.style.cssText = MARKER_STYLE;
  document.body.appendChild(marker);
};

export const hideAddFundsMarker = () => {
  marker?.remove();
  marker = null;
};
