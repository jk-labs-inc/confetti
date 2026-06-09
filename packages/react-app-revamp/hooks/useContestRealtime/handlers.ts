import { ContestParticipantEvent } from "lib/realtime";
import { ParticipantsHandlerDeps } from "./types";

// v1 scope is votes only; onDelete/onSubmit are wired but optional so widening scope is one line.
export function makeParticipantsHandler(deps: ParticipantsHandlerDeps) {
  return (event: ContestParticipantEvent): void => {
    switch (event.type) {
      case "vote.cast":
        deps.onVote(event);
        break;
      case "entry.deleted":
        deps.onDelete?.(event);
        break;
      case "entry.submitted":
        deps.onSubmit?.(event);
        break;
      default:
        break;
    }
  };
}
