import { getJumperBridgeUrl } from "@components/AddFunds/providers/bridges/jumper/utils";
import { LINK_FAQ } from "@config/links";
import { FC } from "react";
import { polygon } from "viem/chains";
import GeoblockedLink from "../Link";
import GeoblockedOption from "../Option";
import GeoblockedOrSticker from "../OrSticker";
import PeekingBubbles from "../PeekingBubbles";
import GeoblockedStep from "../Step";

const LINK_RABBY = "https://rabby.io";
const LINK_METAMASK = "https://metamask.io";
const LINK_BINANCE = "https://www.binance.com";
const LINK_COINBASE = "https://www.coinbase.com";
const LINK_JUMPER_TO_POL = getJumperBridgeUrl(polygon.id, polygon.nativeCurrency.symbol);
const POL_TICKER = <span className="uppercase">$POL</span>;

interface GeoblockedGuidanceProps {
  onDismiss: () => void;
}

const GeoblockedGuidance: FC<GeoblockedGuidanceProps> = ({ onDismiss }) => (
  <div
    id="add_funds_geoblocked_modal"
    className="flex flex-col gap-3 p-6 text-[15px] text-neutral-11 md:gap-4 md:p-10 md:text-[16px]"
  >
    <div className="flex items-end justify-between gap-3 border-b border-neutral-17">
      <p className="pb-2 text-[24px] font-bold leading-tight md:pb-3">your region is restricted from adding funds</p>
      <PeekingBubbles />
    </div>
    <p className="text-[14px] text-neutral-9">
      not in a restricted region? turn off your vpn or ad blocker and reload the page.{" "}
      <GeoblockedLink href={LINK_FAQ}>read more in the faq</GeoblockedLink>
    </p>
    <section className="flex flex-col gap-2 md:gap-2.5">
      <p className="text-[14px] font-bold text-neutral-9">other options</p>
      <div className="flex flex-col">
        <GeoblockedOption label={<>get {POL_TICKER} with cash</>}>
          <ol className="flex flex-col gap-2">
            <GeoblockedStep number={1}>
              create a wallet like <GeoblockedLink href={LINK_RABBY}>rabby</GeoblockedLink> or{" "}
              <GeoblockedLink href={LINK_METAMASK}>metamask</GeoblockedLink>
            </GeoblockedStep>
            <GeoblockedStep number={2}>
              fund it with {POL_TICKER} from an exchange like{" "}
              <GeoblockedLink href={LINK_BINANCE}>binance</GeoblockedLink> or{" "}
              <GeoblockedLink href={LINK_COINBASE}>coinbase</GeoblockedLink>
            </GeoblockedStep>
            <GeoblockedStep number={3}>sign in to confetti with it</GeoblockedStep>
          </ol>
        </GeoblockedOption>
        <GeoblockedOrSticker />
        <GeoblockedOption label={<>get {POL_TICKER} with crypto</>}>
          <p>
            use <GeoblockedLink href={LINK_JUMPER_TO_POL}>jumper</GeoblockedLink> to move your crypto into{" "}
            {POL_TICKER} on polygon
          </p>
        </GeoblockedOption>
      </div>
    </section>
    <button
      className="mt-1 h-10 w-full rounded-[40px] border border-neutral-11 text-[16px] font-bold transition-all duration-300 hover:bg-neutral-11 hover:text-true-black md:mt-2"
      onClick={onDismiss}
    >
      got it
    </button>
  </div>
);

export default GeoblockedGuidance;
