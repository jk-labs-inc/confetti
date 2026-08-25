import { toastDismiss, toastError, toastWarning } from "@components/UI/Toast";
import { txOverlay } from "@components/UI/TransactionOverlay/store";
import { TransactionOverlayFlow } from "@components/UI/TransactionOverlay/types";
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

  const handleError = (e: any, defaultMessage: string, options?: { overlayFlow?: TransactionOverlayFlow }) => {
    const ownsOverlay = options?.overlayFlow !== undefined && txOverlay.isShowing(options.overlayFlow);

    if (didUserReject(e)) {
      toastDismiss();
      if (ownsOverlay) {
        txOverlay.dismiss();
      }
      return;
    }

    const chainName = resolveChainName(chainNameFromPath);

    const handledError = handleUtilityError(e, chainName);

    setError(handledError.message);

    if (ownsOverlay) {
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
