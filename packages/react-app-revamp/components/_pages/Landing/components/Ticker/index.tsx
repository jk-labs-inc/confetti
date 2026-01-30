import Ticker from "@components/UI/Ticker";
import TickerText from "./components/TickerText";
import Image from "next/image";

const LandingPageTicker = () => {
  return (
    <Ticker
      className="bg-positive-18 h-12 flex items-center"
      items={[
        <TickerText>THE EARLIER YOU VOTE THE MORE YOU CAN EARN</TickerText>,
        <Image src="/confetti/confetti-pixelated.svg" alt="confetti" width={41} height={43} />,
        <TickerText>
          <span
            className="text-[14px] font-lato font-black"
            style={{
              WebkitTextStroke: "3px #BB65FF",
              WebkitTextFillColor: "#78ffc6",
              paintOrder: "stroke fill",
              textShadow: "-3px 3px 8px #BB65FF",
            }}
          >
            $
          </span>
          1,750,000 GENERATED FOR VOTERS
        </TickerText>,
        <img src="/landing/snake.svg" alt="" className="h-8" />,
      ]}
    />
  );
};

export default LandingPageTicker;
