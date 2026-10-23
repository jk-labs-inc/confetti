import { Avatar } from "@components/UI/Avatar";
import { CSSProperties, FC } from "react";

interface VoterBubbleProps {
  seed: string;
  sizePx?: number;
  isVisible?: boolean;
  style?: CSSProperties;
  "data-actor"?: string;
  "data-index"?: number;
}

const VoterBubble: FC<VoterBubbleProps> = ({ seed, sizePx = 28, isVisible, style, ...actor }) => (
  <div
    {...actor}
    style={style}
    className={`absolute rounded-full border-2 border-true-black ${isVisible ? "" : "opacity-0"}`}
  >
    <Avatar src="" address={seed} sizePx={sizePx} />
  </div>
);

export default VoterBubble;
