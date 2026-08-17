import AddFundsCard from "@components/AddFunds/components/Card";
import { FC } from "react";

const US_ONRAMP_PLACEHOLDER = {
  name: "i'm american",
  disabledMessage: "currently unavailable",
  logo: "/add-funds/coinbase.svg",
  logoBorderColor: "#0052FF",
};

const AddFundsUsOnrampPlaceholder: FC = () => (
  <AddFundsCard
    name={US_ONRAMP_PLACEHOLDER.name}
    logo={US_ONRAMP_PLACEHOLDER.logo}
    logoBorderColor={US_ONRAMP_PLACEHOLDER.logoBorderColor}
    disabled
    disabledMessage={US_ONRAMP_PLACEHOLDER.disabledMessage}
  />
);

export default AddFundsUsOnrampPlaceholder;
