import { usePathname } from "next/navigation";
import React from "react";
import CreateFlowHeader from "./CreateFlowHeader";
import LandingHeader from "./LandingHeader";
import MainHeader from "./MainHeader";

const Header: React.FC = () => {
  const pathname = usePathname();

  if (pathname === "/") {
    return <LandingHeader />;
  }

  if (pathname?.includes("/new")) {
    return <CreateFlowHeader />;
  }

  return <MainHeader showProfile isContestPage={!!pathname?.startsWith("/contest/")} />;
};

export default Header;
