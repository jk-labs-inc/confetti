import { MOBILE_MAX_WIDTH_PX } from "@helpers/isMobileViewport";
import { FC } from "react";
import { useMediaQuery } from "react-responsive";
import { VoterRibbonProps } from "../types";
import VoterRibbonDesktop from "./VoterRibbonDesktop";
import VoterRibbonMobile from "./VoterRibbonMobile";

const VoterRibbon: FC<VoterRibbonProps> = props => {
  const isMobile = useMediaQuery({ maxWidth: MOBILE_MAX_WIDTH_PX });
  return isMobile ? <VoterRibbonMobile {...props} /> : <VoterRibbonDesktop {...props} />;
};

export default VoterRibbon;
