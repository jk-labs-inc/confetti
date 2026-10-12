"use client";

import { useXClaim } from "@hooks/useXClaim";
import { useXClaimStore, xClaimMemory, xClaimParaCallbacks, xClaimSheet } from "@hooks/useXClaim/store";
import { LAB_PATH } from "../../constants";
import LabButton from "../LabButton";
import LabJson from "../LabJson";

const LabStatePanel = () => {
  const { offer, sheet, actions } = useXClaim();
  const wallet = sheet.view.wallet;
  const store = useXClaimStore();

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-[16px] font-bold text-neutral-11">state</h2>
      <div className="flex flex-wrap gap-2">
        <LabButton onClick={actions.open}>open sheet</LabButton>
        <LabButton onClick={actions.close}>close sheet</LabButton>
        <LabButton onClick={xClaimSheet.reset}>reset flow</LabButton>
        <LabButton onClick={() => actions.startXClaim(LAB_PATH)}>startXClaim</LabButton>
        <LabButton onClick={actions.retryClaim}>retryClaim</LabButton>
        <LabButton onClick={actions.checkStatus}>checkStatus</LabButton>
        <LabButton onClick={() => xClaimParaCallbacks.onLogin({ detail: {} })}>simulate onLogin</LabButton>
        {wallet.kind !== "signed_out" && (
          <LabButton onClick={() => xClaimMemory.set(wallet.address, null)}>forget local memory</LabButton>
        )}
      </div>
      <LabJson title="offer" value={offer} />
      <LabJson title={`sheet · ${sheet.isOpen ? "open" : "closed"} · ${sheet.view.board}`} value={sheet.view} />
      <LabJson title="para sign-in callbacks (newest first)" value={store.signInLog} />
      <LabJson
        title="store"
        value={{
          result: store.result,
          action: store.action,
          pollUntil: store.pollUntil,
          actionRun: store.actionRun,
          memory: store.memory,
          signIn: store.signIn,
        }}
      />
    </div>
  );
};

export default LabStatePanel;
