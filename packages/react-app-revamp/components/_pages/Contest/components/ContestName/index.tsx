import { MOBILE_MAX_WIDTH_PX } from "@helpers/isMobileViewport";
import { FC } from "react";
import { useMediaQuery } from "react-responsive";
import ContestNameDesktop from "./components/ContestNameDesktop";
import ContestNameMobile from "./components/ContestNameMobile";
import type { ContestNameProps } from "./types";

const ContestName: FC<ContestNameProps> = props => {
  const isMobile = useMediaQuery({ maxWidth: MOBILE_MAX_WIDTH_PX });

  return isMobile ? <ContestNameMobile {...props} /> : <ContestNameDesktop {...props} />;
};

export default ContestName;
