import { FC } from "react";
import NoVotesPlaceholderVotingClosed from "./components/NoVotesPlaceholderVotingClosed";
import NoVotesPlaceholderVotingOpen from "./components/NoVotesPlaceholderVotingOpen";

interface NoVotesPlaceholderProps {
  isVotingOpen: boolean;
}

const NoVotesPlaceholder: FC<NoVotesPlaceholderProps> = ({ isVotingOpen }) =>
  isVotingOpen ? <NoVotesPlaceholderVotingOpen /> : <NoVotesPlaceholderVotingClosed />;

export default NoVotesPlaceholder;
