export const GA_TRACKING_ID = "G-ZMLFLXBZCD";
export const GTM_ID = "GTM-W2WHJ2QJ";

type GTagEvent = {
  action: string;
  category: string;
  label: string;
  value: number;
};

export const pageview = (url: URL): void => {
  window.gtag("config", GA_TRACKING_ID, {
    page_path: url,
  });
};

export const event = ({ action, category, label, value }: GTagEvent): void => {
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
  });
};
