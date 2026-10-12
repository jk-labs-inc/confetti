import { boardsWithoutFixture, fixturesOffExpectation, XCLAIM_FIXTURES } from "lib/xClaim/fixtures";
import LabJson from "../LabJson";

const LabFixtureGallery = () => {
  const missing = boardsWithoutFixture(XCLAIM_FIXTURES);
  const offExpectation = fixturesOffExpectation(XCLAIM_FIXTURES);
  const isHealthy = missing.length === 0 && offExpectation.length === 0;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-[16px] font-bold text-neutral-11">fixtures ({XCLAIM_FIXTURES.length})</h2>
      <p
        id="x_claim_lab_coverage"
        data-missing={missing.length}
        data-off-expectation={offExpectation.length}
        className={isHealthy ? "text-positive-11" : "text-negative-11"}
      >
        {isHealthy
          ? "every board has a fixture and every fixture matches its expected board"
          : `missing boards: ${missing.join(", ") || "none"} · off expectation: ${
              offExpectation.map(entry => `${entry.id} (${entry.view.board}, expected ${entry.expected})`).join(", ") ||
              "none"
            }`}
      </p>
      {XCLAIM_FIXTURES.map(fixture => (
        <details key={fixture.id} className="rounded bg-neutral-1 p-2">
          <summary className="cursor-pointer text-[13px] text-neutral-11">
            {fixture.view.board} · {fixture.id}
          </summary>
          <LabJson title="view" value={fixture.view} />
        </details>
      ))}
    </div>
  );
};

export default LabFixtureGallery;
