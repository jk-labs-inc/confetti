import { OUTCOME_CODES } from "lib/xClaim/constants";
import { sampleRedirectHref } from "lib/xClaim/fixtures";
import { LAB_PATH } from "../../constants";

const LAB_CODES = [...OUTCOME_CODES, "bogus"];

const LabRedirectLinks = () => (
  <div className="flex flex-col gap-2">
    <h2 className="text-[16px] font-bold text-neutral-11">redirect outcomes</h2>
    <p className="text-[12px] text-neutral-9">Each link reloads the lab with ?x_claim=…, like the worker&apos;s redirect.</p>
    <div className="flex flex-wrap gap-2">
      {LAB_CODES.map(code => (
        <a
          key={code}
          id={`x_claim_lab_${code}`}
          className="rounded bg-neutral-17 px-2 py-1 text-[12px] text-neutral-11 hover:bg-neutral-3"
          href={sampleRedirectHref(code, LAB_PATH)}
        >
          {code}
        </a>
      ))}
    </div>
  </div>
);

export default LabRedirectLinks;
