import UserProfileDisplay from "@components/UI/UserProfileDisplay";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import { extractTitle } from "../utils/extractTitle";

interface TitleParserProps {
  stringArray: string[];
  enabledPreview: EntryPreview | null;
  authorAddress: string;
}

const TitleParser = ({ stringArray, enabledPreview, authorAddress }: TitleParserProps) => {
  const title = extractTitle(stringArray, enabledPreview);

  if (!title) {
    return null;
  }

  return (
    <div className="pl-6 pr-4 pt-6 pb-2 flex items-baseline gap-1 flex-wrap">
      <p className="text-2xl font-bold text-neutral-11 normal-case leading-tight">&ldquo;{title}&rdquo;</p>
      <span className="text-neutral-9 text-xs font-bold flex items-center gap-1 shrink-0">
        by{" "}
        <UserProfileDisplay
          ethereumAddress={authorAddress}
          shortenOnFallback
          size="extraSmall"
          textColor="text-positive-11"
          textualVersion
          showBy={false}
        />
      </span>
    </div>
  );
};

export default TitleParser;
