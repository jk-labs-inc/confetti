import EthereumDeploymentModal from "@components/UI/Deployment/Ethereum";
import TestnetDeploymentModal from "@components/UI/Deployment/Testnet";
import GradientText from "@components/UI/GradientText";
import { FOOTER_LINKS } from "@config/links";
import { chains } from "@config/wagmi";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { emailRegex } from "@helpers/regex";
import { useDeployContest } from "@hooks/useDeployContest";
import { useDeployContestStore } from "@hooks/useDeployContest/store";
import { useWallet } from "@hooks/useWallet";
import { switchChain } from "@wagmi/core";
import { useCallback, useState } from "react";
import CreateContestButton from "../../components/Buttons/Submit";
import MobileStepper from "../../components/MobileStepper";
import { useContestSteps } from "../../hooks/useContestSteps";
import CreateContestConfirmDescription from "./components/Description";
import CreateContestConfirmEmailSubscription from "./components/EmailSubscription";
import CreateContestConfirmMonetization from "./components/Monetization";
import CreateContestConfirmPreview from "./components/Preview";
import CreateContestConfirmRewards from "./components/Rewards";
import CreateContestConfirmTiming from "./components/Timing";
import CreateContestConfirmTitle from "./components/Title";
import { displayWalletWarning, isEthereumMainnet, isWalletForbidden } from "./utils";

const CreateContestConfirm = () => {
  const {
    chain: { id: chainId, testnet },
    connector,
  } = useWallet();
  const { steps, stepReferences } = useContestSteps();
  const state = useDeployContestStore(state => state);
  const { setEmailSubscriptionAddress, getVotingOpenDate, getVotingCloseDate } = state;
  const { deployContest } = useDeployContest();
  const [isEthereumDeploymentModalOpen, setIsEthereumDeploymentModalOpen] = useState(false);
  const tosHref = FOOTER_LINKS.find(link => link.label === "Terms")?.href;
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isTestnetDeploymentModalOpen, setIsTestnetDeploymentModalOpen] = useState(false);

  const handleChangeChain = useCallback(async () => {
    // Switch to the first non-testnet, non-mainnet chain (polygon is default)
    const defaultChain = chains.find(c => !c.testnet && c.id !== 1) ?? chains[0];
    try {
      await switchChain(getWagmiConfig(), { chainId: defaultChain.id });
    } catch (error) {
      console.error("Failed to switch chain:", error);
    }
  }, []);

  const onDeployHandler = useCallback(() => {
    if (!chainId) {
      return;
    }

    if (connector && isWalletForbidden(connector.id)) {
      displayWalletWarning(connector.id);
      return;
    }

    if (isEthereumMainnet(chainId)) {
      setIsEthereumDeploymentModalOpen(true);
    } else if (testnet) {
      setIsTestnetDeploymentModalOpen(true);
    } else {
      deployContest();
    }
  }, [chainId, connector, deployContest, testnet]);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (!value) {
      setEmailError(null);
    } else if (emailRegex.test(value)) {
      setEmailError(null);
    } else {
      setEmailError("Invalid email address.");
    }
    setEmailSubscriptionAddress(value);
  };

  const onNavigateToStep = (stepIndex: number) => {
    const stepTitle = steps[stepIndex].title;
    const actualStepIndex = steps.findIndex(step => step.title === stepTitle);
    state.setStep(actualStepIndex !== -1 ? actualStepIndex : stepIndex);
  };

  return (
    <div className="flex flex-col">
      <MobileStepper currentStep={state.step} totalSteps={steps.length} />
      <div className="grid grid-cols-(--grid-full-width-create-flow) mt-12 lg:mt-[70px] animate-appear">
        <div className="flex flex-col gap-8 md:ml-10">
          <GradientText textSizeClassName="text-[24px] font-bold" isFontSabo={false}>
            let's confirm
          </GradientText>
          <CreateContestConfirmTitle
            step={stepReferences.ContestRules}
            title={state.title}
            onClick={step => onNavigateToStep(step)}
          />
          <CreateContestConfirmDescription
            step={stepReferences.ContestRules}
            prompt={state.prompt}
            imageUrl={state.prompt.imageUrl}
            onClick={step => onNavigateToStep(step)}
          />
          <CreateContestConfirmPreview
            step={stepReferences.ContestEntries}
            entryPreviewConfig={state.entryPreviewConfig}
            metadataFields={state.metadataFields}
            onClick={step => onNavigateToStep(step)}
          />
          <CreateContestConfirmTiming
            step={stepReferences.ContestTiming}
            onClick={step => onNavigateToStep(step)}
            timing={{
              votingOpen: getVotingOpenDate(),
              votingClose: getVotingCloseDate(),
            }}
          />
          <CreateContestConfirmMonetization
            step={stepReferences.ContestVoting}
            charge={state.charge}
            priceCurve={state.priceCurve}
            onClick={step => onNavigateToStep(step)}
          />
          <CreateContestConfirmRewards
            step={stepReferences.ContestRewards}
            rewardPoolData={state.rewardPoolData}
            addFundsToRewards={state.addFundsToRewards}
            onClick={step => onNavigateToStep(step)}
          />

          <div className="flex flex-col gap-8 mt-6">
            <CreateContestConfirmEmailSubscription
              emailError={emailError}
              emailSubscriptionAddress={state.emailSubscriptionAddress}
              tosHref={tosHref}
              handleEmailChange={handleEmailChange}
            />

            <CreateContestButton step={state.step} onClick={onDeployHandler} isDisabled={!!emailError} />
          </div>
        </div>

        <EthereumDeploymentModal
          isOpen={isEthereumDeploymentModalOpen}
          setIsOpen={value => setIsEthereumDeploymentModalOpen(value)}
          onDeploy={deployContest}
          onChangeChain={handleChangeChain}
        />
        <TestnetDeploymentModal
          isOpen={isTestnetDeploymentModalOpen}
          setIsOpen={value => setIsTestnetDeploymentModalOpen(value)}
          onDeploy={deployContest}
          onChangeChain={handleChangeChain}
        />
      </div>
    </div>
  );
};

export default CreateContestConfirm;
