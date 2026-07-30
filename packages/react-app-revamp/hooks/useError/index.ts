import { toastDismiss, toastError, toastWarning } from "@components/UI/Toast";
import { txOverlay } from "@components/UI/TransactionOverlay/store";
import { chains } from "@config/wagmi";
import { extractPathSegments } from "@helpers/extractPath";
import { useWallet } from "@hooks/useWallet";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { didUserReject, handleError as handleUtilityError } from "utils/error";

export function useError() {
  const pathname = usePathname();
  const { chainName: chainNameFromPath } = extractPathSegments(pathname);
  const { chain: chainFromAccount } = useWallet();
  const [error, setError] = useState<string>("");

  const handleError = (e: any, defaultMessage: string) => {
    if (didUserReject(e)) {
      toastDismiss();
      txOverlay.dismiss();
      return;
    }

    const chainName = resolveChainName(chainNameFromPath);

    const handledError = handleUtilityError(e, chainName);

    setError(handledError.message);

    if (txOverlay.isActive()) {
      txOverlay.fail(handledError.isWarning || handledError.codeFound ? handledError.message : defaultMessage);
      return;
    }

    if (handledError.isWarning) {
      return toastWarning({
        message: handledError.message,
        additionalMessage: handledError.additionalMessage,
      });
    }

    if (handledError.codeFound) {
      toastError({
        message: handledError.message,
        additionalMessage: handledError.additionalMessage,
        codeFound: true,
      });
    } else {
      toastError({
        message: defaultMessage,
        messageToCopy: handledError.message,
      });
    }
  };

  const resolveChainName = (chainName: string) => {
    if (chainName !== chains.filter(chain => chain.name.toLowerCase() === chainName.toLowerCase())[0]?.name) {
      return chainFromAccount?.name ?? "";
    }
    return chainName;
  };

  return { error, handleError };
}
