export const GA_TRACKING_ID = "G-BT18WQWMCB"; // replace with real ID

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label: string;
  value?: number;
}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value,
    });
  }
};
