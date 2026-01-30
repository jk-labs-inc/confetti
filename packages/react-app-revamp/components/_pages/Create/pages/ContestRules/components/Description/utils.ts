import { PriceCurveType } from "@hooks/useDeployContest/types";
import moment from "moment";

const SUMMARY_TEMPLATE =
  "Vote and earn. Voting runs from [voting open date] to [voting close date]. Buy as many votes as you like on [article] [price curve] price curve, 90% of your funds go into the rewards pool, and you can earn by voting on the winner. You can earn <em>even more</em> by voting early with conviction to get cheaper votes and a bigger share of the rewards pool. But be careful. If you wait too long, you might lose money... even if you vote on a winner. You can always calculate your earnings here: https://docs.confetti.win/calculating-roi.";

const formatDate = (date: Date) =>
  date
    ? moment(date).format("h:mmA") +
      " " +
      moment.tz(moment.tz.guess()).zoneAbbr() +
      " on " +
      moment(date).format("MMMM D")
    : "";

const getPriceCurveLabel = (priceCurveType: PriceCurveType): string => {
  switch (priceCurveType) {
    case PriceCurveType.Exponential:
      return "exponential";
    default:
      return "price curve";
  }
};

const getArticle = (priceCurveType: PriceCurveType): string => {
  const label = getPriceCurveLabel(priceCurveType);
  return ["a", "e", "i", "o", "u"].includes(label[0].toLowerCase()) ? "an" : "a";
};

export const generateDynamicSummary = (priceCurveType: PriceCurveType, votingOpen: Date, votingClose: Date) => {
  let result = SUMMARY_TEMPLATE;

  const placeholders = {
    "[voting open date]": formatDate(votingOpen),
    "[voting close date]": formatDate(votingClose),
    "[price curve]": getPriceCurveLabel(priceCurveType),
    "[article]": getArticle(priceCurveType),
  };

  for (const [placeholder, value] of Object.entries(placeholders)) {
    result = result.split(placeholder).join(String(value));
  }

  return result;
};
