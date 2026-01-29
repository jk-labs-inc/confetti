import { useBelloRedirectUrl } from "@hooks/useBello";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { compareVersions } from "compare-versions";
import { useShallow } from "zustand/shallow";
import { Extension } from "../../../types";
import ExtensionCard from "../../Card";

const BELLO_EXTENSION: Extension = {
  name: "bello",
  metadata: {
    title: "get analytics on your community",
    creator: "by bello",
    description: "learn about users’ behaviors across chains—powerful for getting sponsors and partners",
    buttonLabel: "get insights",
  },
};

const BELLO_SUPPORTED_CHAINS = [
  "optimism",
  "arbitrumone",
  "berachaintestnet",
  "polygontestnet",
  "polygon",
  "base",
  "ethereum",
  "sepolia",
  "mantle",
  "mode",
  "arthera",
  "taikotestnet",
];

const CONFETTI_MIN_VERSION = "3.16";

const BelloExtension = () => {
  const contestConfig = useContestConfigStore(useShallow(state => state.contestConfig));
  const { redirectUrl, isLoading, isError } = useBelloRedirectUrl(
    contestConfig.address,
    contestConfig.chainName.toLowerCase(),
  );
  const isSupportedChain = BELLO_SUPPORTED_CHAINS.includes(contestConfig.chainName.toLowerCase());
  const isSupportedVersion = compareVersions(contestConfig.version, CONFETTI_MIN_VERSION) >= 0;

  if (!isSupportedChain || !isSupportedVersion) return null;

  const onBelloExtensionClick = () => {
    window.open(redirectUrl, "_blank");
  };

  return (
    <ExtensionCard
      metadata={BELLO_EXTENSION.metadata}
      onClick={onBelloExtensionClick}
      disabled={isLoading || isError}
    />
  );
};

export default BelloExtension;
