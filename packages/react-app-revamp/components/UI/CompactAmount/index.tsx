import { FC } from "react";

// ≥4 consecutive zeros after the decimal point — below that the plain form stays readable
const MICRO_ZEROS = /0\.(0{4,})(\d+)/;

/**
 * Renders a formatted amount string, compressing a micro value's leading zeros into
 * subscript-count notation: "0.0000054 $eth" → "0.0₅54 $eth". Strings without a
 * ≥4-zero run pass through unchanged, so any display string can be wrapped safely.
 * Display-only — never use for values the user is meant to type or copy verbatim.
 */
const CompactAmount: FC<{ value: string }> = ({ value }) => {
  const match = MICRO_ZEROS.exec(value);
  if (!match) return <>{value}</>;

  const before = value.slice(0, match.index);
  const after = value.slice(match.index + match[0].length);

  return (
    <span aria-label={value}>
      <span aria-hidden="true">
        {before}0.0<span className="align-sub text-[0.6em]">{match[1].length}</span>
        {match[2]}
        {after}
      </span>
    </span>
  );
};

export default CompactAmount;
