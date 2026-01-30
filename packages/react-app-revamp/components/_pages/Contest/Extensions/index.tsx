import { useExtensions } from "@hooks/useExtensions";
import { useMediaQuery } from "react-responsive";
import ExtensionsList from "./components/List";

const ContestExtensions = () => {
  const { enabledExtensions, isLoading, isError } = useExtensions();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  if (isLoading) return <p className="loadingDots font-sabo-filled text-[16px] text-neutral-14">loading extensions</p>;

  if (isError)
    return (
      <p className="text-negative-11 font-bold text-[16px]">
        ruh-roh! there was an error while fetching extensions, please reload the page!
      </p>
    );

  if (!enabledExtensions?.length)
    return <div className="text-neutral-11 text-[20px] normal-case">hmm what’s this page doing here? 👀</div>;

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {isMobile ? (
        <p className="text-neutral-11 text-[16px] normal-case">
          extensions are integrations with other services <br />
          to unlock your contest with new utilities. <i>anyone</i> <br />
          can build an extension, and these are some favs:
        </p>
      ) : (
        <p className="text-neutral-11 text-[20px] normal-case">
          extensions are Confetti integrations built by other services on top of our contests that let you access new
          forms of analytics, incentives, and <br />
          rewards. <i>anyone</i> can build an extension, and we feature our favorites here.
        </p>
      )}

      <ExtensionsList enabledExtensions={enabledExtensions} />
    </div>
  );
};

export default ContestExtensions;
