import { X_CLAIM_IDS } from "@components/XClaim/constants";
import BoardHero from "@components/XClaim/parts/BoardHero";
import BoardLayout from "@components/XClaim/parts/BoardLayout";
import CheckIcon from "@components/XClaim/parts/CheckIcon";
import SpotsLine from "@components/XClaim/parts/SpotsLine";
import { CLAIM_TITLE, shortAddress } from "@components/XClaim/copy";
import type { XClaimExternalWallet, XClaimSpots } from "lib/xClaim/types";
import { FC } from "react";

interface ClaimExternalWalletBoardProps {
  wallet: XClaimExternalWallet;
  activeStep: 1 | 2;
  spots: XClaimSpots | null;
  onSign: () => void;
}

const STEPS = [
  { step: 1, label: "prove this wallet is yours", tilt: "-rotate-2" },
  { step: 2, label: "connect x, then bubbles checks it", tilt: "rotate-[1.5deg]" },
] as const;

const ClaimExternalWalletBoard: FC<ClaimExternalWalletBoardProps> = ({ wallet, activeStep, spots, onSign }) => (
  <BoardLayout
    width="claim"
    titleSize="large"
    hero={<BoardHero art="ballot" size={176} bubble="on_us" />}
    title={CLAIM_TITLE}
    body="two quick steps. signing is free and doesn't move any money."
    primary={{ kind: "run", id: X_CLAIM_IDS.signMessage, label: "sign message", onPress: onSign }}
    secondary={{ role: "dismiss", label: "maybe later" }}
  >
    <div className="flex flex-col items-center gap-2.5">
      {STEPS.map(({ step, label, tilt }) => {
        const isActive = step === activeStep;
        const isDone = step < activeStep;
        return (
          <span
            key={step}
            data-step={step}
            data-active={isActive}
            className={`inline-flex items-center gap-2.5 rounded-full text-[15px] font-bold ${tilt} ${
              isActive
                ? "bg-neutral-2 py-2.5 pr-[18px] pl-2.5 text-neutral-11"
                : "border border-dashed border-primary-3 py-[9px] pr-[18px] pl-[9px] text-neutral-9"
            }`}
          >
            <span
              className={`flex size-[26px] items-center justify-center rounded-full text-[13px] ${
                isActive ? "bg-neutral-11 text-true-black" : "bg-neutral-2 font-black"
              }`}
            >
              {isDone ? <CheckIcon size={14} /> : step}
            </span>
            {label}
          </span>
        );
      })}
      <span className="text-[13px] text-neutral-9">
        {[shortAddress(wallet.address), wallet.walletName].filter(Boolean).join(" · ")}
      </span>
    </div>
    <SpotsLine spots={spots} />
  </BoardLayout>
);

export default ClaimExternalWalletBoard;
