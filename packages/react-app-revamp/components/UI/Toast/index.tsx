import { toast } from "react-toastify";
import ErrorToast from "./components/Error";
import InfoToast from "./components/Info";
import LoadingToast from "./components/Loading";
import SuccessToast from "./components/Success";
import { ErrorToastConfig, InfoToastConfig, LoadingToastConfig, SuccessToastConfig, WarningToastConfig } from "./types";
import WarningToast from "./components/Warning";

let toastId: any = null;

const commonSettings = {
  autoClose: 2000,
  icon: false,
  onClose: () => {
    toastId = null;
  },
};

const createToast = (type: any, content: React.JSX.Element, additionalSettings: any = {}) => {
  const settings = { ...commonSettings, ...additionalSettings, type };

  if (toastId !== null) {
    toast.dismiss(toastId);
  }

  toastId = toast(content, settings);
};

export const toastInfo = (config: InfoToastConfig) => {
  createToast("info", <InfoToast message={config.message} additionalMessage={config.additionalMessage} />, {
    autoClose: 2000,
  });
};

export const toastSuccess = (config: SuccessToastConfig) => {
  createToast("success", <SuccessToast message={config.message} id={config.id} dataAttributes={config.dataAttributes} />);
};

export const toastWarning = (config: WarningToastConfig) => {
  createToast("warning", <WarningToast message={config.message} additionalMessage={config.additionalMessage} />);
};

export const toastError = (config: ErrorToastConfig) => {
  createToast(
    "error",
    <ErrorToast
      messageToShow={config.message}
      messageToCopy={config.messageToCopy}
      additionalMessage={config.additionalMessage}
      type={config.type}
      codeFound={config.codeFound}
    />,
    {
      autoClose: false,
      className: "error-toast",
    },
  );
};

export const toastLoading = (config: LoadingToastConfig) => {
  createToast("info", <LoadingToast message={config.message} additionalMessageType={config.additionalMessageType} />, {
    autoClose: false,
  });
};

export const toastDismiss = () => {
  if (toastId !== null) {
    toast.dismiss(toastId);
    toastId = null;
  }
};
