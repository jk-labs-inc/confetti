import { chains } from "@config/wagmi";
import { getTimeZoneAbbreviation } from "@helpers/dates";
import { extractPathSegments } from "@helpers/extractPath";
import { useContestStore } from "@hooks/useContest/store";
import moment from "moment";
import { usePathname } from "next/navigation";
import ContestParametersEarnings from "./components/Earnings";
import ContestParametersRewards from "./components/Rewards";
import ContestParametersSubmissions from "./components/Submissions";
import ContestParametersTimeline from "./components/Timeline";
import ContestParametersVoting from "./components/Voting";
import { useShallow } from "zustand/shallow";
import useContestConfigStore from "@hooks/useContestConfig/store";

const ContestParameters = () => {
  const version = useContestConfigStore(useShallow(state => state.contestConfig.version));
  const { submissionsOpen, votesClose, votesOpen, contestAuthorEthereumAddress, charge } = useContestStore(
    state => state,
  );
  const asPath = usePathname();
  const { chainName } = extractPathSegments(asPath ?? "");
  const blockExplorerUrl = chains.find(chain => chain.name.toLowerCase() === chainName.toLowerCase())?.blockExplorers
    ?.default.url;
  const formattedSubmissionsOpen = (
    <>
      {moment(submissionsOpen).format("MMMM Do, h:mm a")}{" "}
      <span className="uppercase">{getTimeZoneAbbreviation(submissionsOpen)}</span>
    </>
  );
  const formattedVotesOpen = (
    <>
      {moment(votesOpen).format("MMMM Do, h:mm a")} <span className="uppercase">{getTimeZoneAbbreviation(votesOpen)}</span>
    </>
  );
  const formattedVotesClosing = (
    <>
      {moment(votesClose).format("MMMM Do, h:mm a")}{" "}
      <span className="uppercase">{getTimeZoneAbbreviation(votesClose)}</span>
    </>
  );

  return (
    <div className="flex flex-col gap-12 animate-fade-in">
      <ContestParametersTimeline
        submissionsOpen={formattedSubmissionsOpen}
        votesOpen={formattedVotesOpen}
        votesClose={formattedVotesClosing}
      />
      <div className="flex flex-col gap-8">
        {version && <ContestParametersRewards version={version} charge={charge} />}
        <ContestParametersSubmissions />
        <ContestParametersVoting />
        <ContestParametersEarnings
          charge={charge}
          contestAuthor={contestAuthorEthereumAddress}
          blockExplorerUrl={blockExplorerUrl}
        />
      </div>
    </div>
  );
};

export default ContestParameters;
