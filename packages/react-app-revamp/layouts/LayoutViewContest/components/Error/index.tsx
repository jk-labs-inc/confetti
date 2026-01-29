import CustomLink from "@components/UI/Link";
import { ROUTE_VIEW_CONTESTS } from "@config/routes";
import { ErrorType } from "@hooks/useContest/store";
import { FC } from "react";

interface LayoutViewContestErrorProps {
  error: ErrorType;
  bugReportLink: string;
}

const LayoutViewContestError: FC<LayoutViewContestErrorProps> = ({ error, bugReportLink }) => {
  if (error === ErrorType.RPC) {
    return (
      <div className="flex flex-col gap-6 m-auto animate-appear">
        <h1 className="text-[40px] lg:text-[40px] font-sabo-filled text-negative-10 text-center">ruh-roh!</h1>
        <p className="text-[16px] font-bold text-neutral-11 text-center">
          it looks like we can’t connect to the chain to load this contest—please check the link as well as any malware
          blockers you have installed, or try on another browser or device. <br />
          if that doesn’t work,{" "}
          <a href={bugReportLink} target="no_blank" className="text-positive-11">
            please file a bug report so we can look into this
          </a>
        </p>
      </div>
    );
  }

  if (error === ErrorType.CONTRACT) {
    return (
      <div className="flex flex-col gap-6 m-auto animate-appear">
        <h1 className="text-[40px] lg:text-[40px] font-sabo-filled text-negative-10 text-center">ruh-roh!</h1>
        <p className="text-[16px] font-bold text-neutral-11 text-center">
          we were unable to fetch this contest — please check url to make sure it’s accurate <i>or</i> search for
          contests{" "}
          <CustomLink href={ROUTE_VIEW_CONTESTS} className="text-positive-11">
            here
          </CustomLink>
        </p>
      </div>
    );
  }

  if (error === ErrorType.IS_NOT_JOKERACE_CONTRACT) {
    return (
      <div className="flex flex-col gap-6 m-auto animate-appear">
        <h1 className="text-[40px] lg:text-[40px] font-sabo-filled text-negative-10 text-center">ruh-roh!</h1>
        <p className="text-[16px] font-bold text-neutral-11 text-center">
          looks like this contract wasn’t deployed through Confetti. Please check the contract address and try again.
        </p>
      </div>
    );
  }

  if (error === ErrorType.UNSUPPORTED_VERSION) {
    return (
      <div className="flex flex-col gap-6 m-auto animate-appear">
        <h1 className="text-[40px] lg:text-[40px] font-sabo-filled text-negative-10 text-center">ruh-roh!</h1>
        <p className="text-[16px] font-bold text-neutral-11 text-center">
          this contest is of an outdated version that is no longer supported - you can always check the transactions
          onchain though!
        </p>
      </div>
    );
  }

  return null;
};

export default LayoutViewContestError;
