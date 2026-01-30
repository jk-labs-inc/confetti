"use client";
import SendFunds from "@components/SendFunds";
import CustomLink from "@components/UI/Link";
import UserProfileDisplay from "@components/UI/UserProfileDisplay";
import {
  ROUTE_VIEW_USER,
  ROUTE_VIEW_USER_COMMENTS,
  ROUTE_VIEW_USER_SUBMISSIONS,
  ROUTE_VIEW_USER_VOTING,
} from "@config/routes";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useMediaQuery } from "react-responsive";

interface LayoutUserProps {
  address: string;
  children: ReactNode;
}

const navLinks = [
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
  {
    href: ROUTE_VIEW_USER_COMMENTS,
    label: "Comments",
  },
];

function isActiveLink(pathname: string, hrefTemplate: string, address: string) {
  const actualHref = hrefTemplate.replace("[address]", address);

  return pathname === actualHref;
}

const LayoutUser = (props: LayoutUserProps) => {
  const { children, address } = props;
  const pathname = usePathname();
  const [indicatorStyle, setIndicatorStyle] = useState({ left: "0px", width: "0px" });
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isMobile = useMediaQuery({ maxWidth: "768px" });
  const [isSendFundsModalOpen, setIsSendFundsModalOpen] = useState(false);

  useEffect(() => {
    const activeTabIndex = navLinks.findIndex(link => isActiveLink(pathname ?? "", link.href, address));

    const activeTabRef = tabRefs.current[activeTabIndex];

    if (activeTabRef) {
      setIndicatorStyle({
        left: `${activeTabRef.offsetLeft}px`,
        width: `${activeTabRef.offsetWidth}px`,
      });
    }
  }, [address, pathname]);

  return (
    <>
      <SkeletonTheme baseColor="#706f78" highlightColor="#FFE25B" duration={1}>
        <div className="container mx-auto mt-4 md:mt-12">
          {!address ? (
            <div className="flex items-center gap-6">
              <Skeleton circle height={100} width={100} />
              <Skeleton height={24} width={200} />
            </div>
          ) : (
            <UserProfileDisplay
              ethereumAddress={address}
              shortenOnFallback
              size={isMobile ? "medium" : "large"}
              includeSocials
              includeSendFunds
              onSendFundsClick={() => {
                setIsSendFundsModalOpen(true);
              }}
            />
          )}

          <div className="relative mt-12 flex-col gap-2">
            <div className="flex justify-between gap-4 lg:justify-start mb-4 sm:gap-8 sm:px-0">
              {navLinks.map((link, index) => (
                <CustomLink href={link.href.replace("[address]", address)} key={link.href}>
                  <div
                    ref={(el: HTMLDivElement | null) => {
                      tabRefs.current[index] = el;
                      return;
                    }}
                    className={`font-sabo-filled py-2 text-[14px] sm:text-[20px] cursor-pointer transition-colors duration-200 ${
                      isActiveLink(pathname ?? "", link.href, address) ? "text-positive-11" : "text-neutral-11"
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
        </div>
        <SendFunds
          isOpen={isSendFundsModalOpen}
          onClose={() => setIsSendFundsModalOpen(false)}
          recipientAddress={address}
        />
      </SkeletonTheme>

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

export default LayoutUser;
