import CustomLink from "@components/UI/Link";
import {
  ROUTE_VIEW_CONTESTS,
  ROUTE_VIEW_LIVE_CONTESTS,
  ROUTE_VIEW_PAST_CONTESTS,
  ROUTE_VIEW_UPCOMING_CONTESTS,
} from "@config/routes";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface LayoutContestsProps {
  children: React.ReactNode;
}

const navLinks = [
  {
    href: ROUTE_VIEW_CONTESTS,
    label: "Search",
  },
  {
    href: ROUTE_VIEW_LIVE_CONTESTS,
    label: "Live",
  },
  {
    href: ROUTE_VIEW_PAST_CONTESTS,
    label: "Past",
  },
  {
    href: ROUTE_VIEW_UPCOMING_CONTESTS,
    label: "Upcoming",
  },
];

const LayoutContests = (props: LayoutContestsProps) => {
  const { children } = props;
  const pathname = usePathname();
  const [indicatorStyle, setIndicatorStyle] = useState({ left: "0px", width: "0px" });
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const activeTabIndex = navLinks.findIndex(link => link.href === pathname);
    const activeTabRef = tabRefs.current[activeTabIndex];

    if (activeTabRef) {
      setIndicatorStyle({
        left: `${activeTabRef.offsetLeft}px`,
        width: `${activeTabRef.offsetWidth}px`,
      });
    }
  }, [pathname]);

  return (
    <>
      <div className="relative mt-10 flex-col gap-2">
        <div className="flex gap-4 justify-center mb-4 px-2 sm:gap-8 sm:px-0">
          {navLinks.map((link, index) => (
            <CustomLink href={link.href} key={link.href}>
              <div
                ref={(el: HTMLDivElement | null) => {
                  tabRefs.current[index] = el;
                  return;
                }}
                className={`navLink-desktop whitespace-nowrap font-sabo-filled text-[14px] sm:text-[20px] cursor-pointer transition-colors duration-200 ${
                  pathname === link.href ? "text-positive-11" : "text-neutral-11"
                }`}
              >
                {link.label}
              </div>
            </CustomLink>
          ))}
          <div className="absolute left-0 w-full h-1 bottom-0 bg-neutral-0"></div>
          <div
            style={indicatorStyle}
            className="absolute bottom-0 h-1 bg-positive-11 transition-all duration-200"
          ></div>
        </div>
      </div>

      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <div role="alert" className="container m-auto sm:text-center">
            <p className="text-4xl font-black mb-3 text-neutral-11">Something went wrong</p>
            <p className="text-neutral-12 mb-4">{error?.message ?? error}</p>
            <p className="mb-6">
              This site&apos;s current deployment does not have access to Confetti&apos;s reference database of
              contests, but you can check out our Supabase backups{" "}
              <a
                className="link px-1ex"
                href="https://github.com/jk-labs-inc/confetti/tree/staging/packages/supabase"
                target="_blank"
                rel="noreferrer"
              >
                here
              </a>{" "}
              for contest chain and address information!
            </p>
            {/* TODO: replace this with button v3 component */}
            {/* <Button onClick={resetErrorBoundary}>Try loading live contests again</Button> */}
          </div>
        )}
      >
        {children}
      </ErrorBoundary>
    </>
  );
};

export default LayoutContests;
