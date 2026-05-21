import { ROUTE_VIEW_USER, ROUTE_VIEW_USER_SUBMISSIONS, ROUTE_VIEW_USER_VOTING } from "@config/routes";

export const NAV_LINKS = [
  {
    href: ROUTE_VIEW_USER,
    label: "Contests",
  },
  {
    href: ROUTE_VIEW_USER_SUBMISSIONS,
    label: "Entries",
  },
  {
    href: ROUTE_VIEW_USER_VOTING,
    label: "Votes",
  },
] as const;
