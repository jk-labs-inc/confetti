import ButtonV3, { ButtonSize } from "@components/UI/ButtonV3";
import { useContestStore } from "@hooks/useContest/store";
import { useProposalStore } from "@hooks/useProposal/store";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
import { SubmitBarVariant } from "../useContestSubmitButton";

interface ContestSubmitBarProps {
  variant: SubmitBarVariant;
}

const MOBILE_NAV_SLOT_ID = "mobile-create-nav-slot";

const useMobileNavSlot = (enabled: boolean) => {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) {
      setSlot(null);
      return;
    }

    const existing = document.getElementById(MOBILE_NAV_SLOT_ID);
    if (existing) {
      setSlot(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = document.getElementById(MOBILE_NAV_SLOT_ID);
      if (el) {
        setSlot(el);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [enabled]);

  return slot;
};

const ContestSubmitBar = ({ variant }: ContestSubmitBarProps) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const submissionsCount = useProposalStore(useShallow(state => state.submissionsCount));
  const contestMaxProposalCount = useContestStore(useShallow(state => state.contestMaxProposalCount));
  const showsMobileBar = isMobile && (variant.kind === "counter-submit" || variant.kind === "connect");
  const mobileSlot = useMobileNavSlot(showsMobileBar);

  if (variant.kind === "hidden") return null;

  if (variant.kind === "creator-only-message") {
    return <p className="mt-6 text-[16px] text-secondary-11">only the contest creator can submit entries</p>;
  }

  const submitButton = renderButton(variant, isMobile);

  if (isMobile) {
    if (!mobileSlot) return null;
    return ReactDOM.createPortal(
      <div className="flex items-center justify-between gap-3 px-6 py-3 border-t border-neutral-2">
        {variant.kind === "counter-submit" ? (
          <>
            <p className="text-[16px] font-bold text-neutral-9">
              {submissionsCount} / {contestMaxProposalCount} entries submitted
            </p>
            {submitButton}
          </>
        ) : (
          <div className="flex w-full justify-end">{submitButton}</div>
        )}
      </div>,
      mobileSlot,
    );
  }

  return (
    <div className="flex flex-col items-start gap-4 my-6">
      {submitButton}
      {variant.kind === "counter-submit" && (
        <p className="text-[16px] font-bold text-neutral-9">
          {submissionsCount} / {contestMaxProposalCount} entries submitted
        </p>
      )}
    </div>
  );
};

const renderButton = (variant: SubmitBarVariant, isMobile: boolean) => {
  if (variant.kind === "counter-submit") {
    return (
      <ButtonV3
        colorClass="bg-gradient-purple rounded-[40px]"
        textColorClass="text-[16px] font-bold text-true-black"
        size={isMobile ? ButtonSize.SUBMIT_ENTRY_MOBILE : ButtonSize.SUBMIT_ENTRY}
        onClick={variant.onClick}
      >
        submit entry
      </ButtonV3>
    );
  }

  if (variant.kind === "connect") {
    return (
      <ButtonV3
        colorClass="bg-gradient-vote rounded-[40px]"
        textColorClass="text-[16px] font-bold text-true-black"
        size={ButtonSize.SUBMIT_ENTRY}
        onClick={variant.onClick}
      >
        connect wallet to enter
      </ButtonV3>
    );
  }

  return null;
};

export default ContestSubmitBar;
