import TestnetDeploymentModal from "@components/UI/Deployment/Testnet";
import GradientText from "@components/UI/GradientText";
import UpdatesSignup from "@components/UI/UpdatesSignup";
import { chains } from "@config/wagmi";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { emailRegex } from "@helpers/regex";
import { useDeployContest } from "@hooks/useDeployContest";
import { useDeployContestStore } from "@hooks/useDeployContest/store";
import { useWallet } from "@hooks/useWallet";
import { switchChain } from "@wagmi/core";
import { isPhoneNumberEmpty, isValidPhoneNumber } from "lib/phone";
import { useState } from "react";
import { useShallow } from "zustand/shallow";
import { useCreateContestValidation } from "../../hooks/useCreateContestValidation";
import { SIGNUP_BLOCK_ID, useSectionNavigation } from "../../hooks/useSectionNavigation";
import { useSeedDefaultSummary } from "../../hooks/useSeedDefaultSummary";
import CreateContestDurationSection from "../../sections/Duration";
import CreateContestDescriptionSection from "../../sections/Description";
import CreateContestParametersSection from "../../sections/Parameters";
import CreateContestPriceCurveSection from "../../sections/PriceCurve";
import CreateContestRewardsSection from "../../sections/Rewards";
import { useCreateContestFormStore } from "../../store";
import { displayWalletWarning, isWalletForbidden } from "../../utils/wallet";
import CreateContestButton from "../Buttons/Submit";
import CreateContestIntroBlurb from "../IntroBlurb";
import CreateFormSection from "../Section";
import CreateSeedRewardsToggle from "../SeedRewardsToggle";
import CreateContestTitleField from "../TitleField";

const CreateContestForm = () => {
  const { chain, connector, isConnected } = useWallet();
  const {
    emailSubscriptionAddress,
    phoneNumberForSubscription,
    setEmailSubscriptionAddress,
    setPhoneNumberForSubscription,
    setRewardPoolData,
  } = useDeployContestStore(
    useShallow(state => ({
      emailSubscriptionAddress: state.emailSubscriptionAddress,
      phoneNumberForSubscription: state.phoneNumberForSubscription,
      setEmailSubscriptionAddress: state.setEmailSubscriptionAddress,
      setPhoneNumberForSubscription: state.setPhoneNumberForSubscription,
      setRewardPoolData: state.setRewardPoolData,
    })),
  );
  const incrementSubmitCount = useCreateContestFormStore(useShallow(state => state.incrementSubmitCount));
  const { deployContest } = useDeployContest();
  const { scrollToError, openAndScrollTo } = useSectionNavigation();
  const [isTestnetDeploymentModalOpen, setIsTestnetDeploymentModalOpen] = useState(false);
  const [shakeSignal, setShakeSignal] = useState(0);

  useSeedDefaultSummary();

  const emailError =
    !emailSubscriptionAddress || emailRegex.test(emailSubscriptionAddress) ? null : "Invalid email address.";
  const phoneNumberError =
    isPhoneNumberEmpty(phoneNumberForSubscription) || isValidPhoneNumber(phoneNumberForSubscription)
      ? null
      : "Invalid phone number.";

  const { errorFor, validate } = useCreateContestValidation({ isConnected, emailError, phoneNumberError });

  const handleChangeChain = async () => {
    const defaultChain = chains[0];
    try {
      await switchChain(getWagmiConfig(), { chainId: defaultChain.id });
    } catch (error) {
      console.error("Failed to switch chain:", error);
    }
  };

  const onCreateHandler = () => {
    incrementSubmitCount();

    const errors = validate();
    if (errors.length > 0) {
      setShakeSignal(signal => signal + 1);
      scrollToError(errors[0].location);
      return;
    }

    if (!chain?.id) {
      return;
    }

    if (connector && isWalletForbidden(connector.id)) {
      displayWalletWarning(connector.id);
      return;
    }

    setRewardPoolData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(recipient => recipient.proportion !== null && recipient.proportion > 0),
    }));

    if (chain?.testnet) {
      setIsTestnetDeploymentModalOpen(true);
    } else {
      deployContest();
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full md:max-w-[640px] mx-auto mt-6 lg:mt-12 animate-appear">
      <GradientText textSizeClassName="text-[24px] font-bold" isFontSabo={false}>
        create a contest
      </GradientText>
      <CreateContestIntroBlurb />
      <CreateContestTitleField errorMessage={errorFor("title")} />
      <CreateSeedRewardsToggle onCheckedChange={checked => checked && openAndScrollTo("rewards")} />

      <div className="flex flex-col border-y border-primary-3 divide-y divide-primary-3 mt-2">
        <CreateFormSection id="duration" title="duration" errorMessage={errorFor("duration")}>
          <CreateContestDurationSection />
        </CreateFormSection>
        <CreateFormSection id="description" title="description" errorMessage={errorFor("description")}>
          <CreateContestDescriptionSection />
        </CreateFormSection>
        <CreateFormSection id="parameters" title="parameters" errorMessage={errorFor("parameters")}>
          <CreateContestParametersSection />
        </CreateFormSection>
        <CreateFormSection id="priceCurve" title="price curve" errorMessage={errorFor("priceCurve")}>
          <CreateContestPriceCurveSection />
        </CreateFormSection>
        <CreateFormSection id="rewards" title="rewards" errorMessage={errorFor("rewards")}>
          <CreateContestRewardsSection />
        </CreateFormSection>
      </div>

      <div id={SIGNUP_BLOCK_ID} className="flex flex-col gap-8 mt-2 scroll-mt-20 pb-8">
        <UpdatesSignup
          className="md:w-[328px]"
          phoneNumber={phoneNumberForSubscription}
          email={emailSubscriptionAddress}
          phoneNumberError={phoneNumberError}
          emailError={emailError}
          onPhoneNumberChange={setPhoneNumberForSubscription}
          onEmailChange={setEmailSubscriptionAddress}
        />
        <CreateContestButton onClick={onCreateHandler} errorShakeSignal={shakeSignal} />
      </div>

      <TestnetDeploymentModal
        isOpen={isTestnetDeploymentModalOpen}
        setIsOpen={value => setIsTestnetDeploymentModalOpen(value)}
        onDeploy={deployContest}
        onChangeChain={handleChangeChain}
      />
    </div>
  );
};

export default CreateContestForm;
