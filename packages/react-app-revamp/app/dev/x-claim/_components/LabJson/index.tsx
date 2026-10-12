import { XClaimError } from "lib/xClaim/client";
import { FC } from "react";

interface LabJsonProps {
  title: string;
  value: unknown;
}

const replacer = (_key: string, value: unknown) =>
  value instanceof XClaimError ? { error: value.name, failure: value.failure } : value;

const LabJson: FC<LabJsonProps> = ({ title, value }) => (
  <section className="flex flex-col gap-1">
    <h3 className="text-[12px] uppercase tracking-wide text-neutral-9">{title}</h3>
    <pre className="max-h-[420px] overflow-auto rounded bg-neutral-2 p-3 text-[12px] normal-case leading-snug text-neutral-11">
      {JSON.stringify(value, replacer, 2) ?? "undefined"}
    </pre>
  </section>
);

export default LabJson;
