import { FC } from "react";
import { useMediaQuery } from "react-responsive";
import { MOBILE_BREAKPOINT } from "../constants";
import { VoterRibbonProps } from "../types";
import VoterRibbonDesktop from "./VoterRibbonDesktop";
import VoterRibbonMobile from "./VoterRibbonMobile";

const VoterRibbon: FC<VoterRibbonProps> = props => {
  const isMobile = useMediaQuery({ query: `(max-width: ${MOBILE_BREAKPOINT}px)` });
  return isMobile ? <VoterRibbonMobile {...props} /> : <VoterRibbonDesktop {...props} />;
};

export default VoterRibbon;
