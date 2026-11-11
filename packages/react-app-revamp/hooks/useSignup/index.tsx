import { toastError, toastLoading, toastSuccess } from "@components/UI/Toast";
import { isSupabaseConfigured } from "@helpers/database";
import { postJson } from "@helpers/fetchJson";
import type { SignupCheck, SignupCheckResult, SignupInsert, SignupKind, SignupResult } from "lib/supabase/types";
import { useState } from "react";

interface CheckIfValueExistsProps {
  value: string;
  displayToasts?: boolean;
  userAddress?: string;
}

interface UseSignupConfig {
  kind: SignupKind;
  valueLabel: string;
  onSubscribeSuccess?: (userAddress: string | null) => Promise<void>;
}

const useSignup = ({ kind, valueLabel, onSubscribeSuccess }: UseSignupConfig) => {
  const [isLoading, setLoading] = useState(false);

  const subscribe = async (
    value: string,
    user_address: string | null,
    showToasts: boolean = true,
  ): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      return false;
    }

    setLoading(true);
    showToasts &&
      toastLoading({
        message: "Subscribing...",
      });
    try {
      const signup: SignupInsert = { kind, value, userAddress: user_address };
      const { replacesExisting } = await postJson<SignupResult>("/api/signups", signup);

      let successMessage = "You have been subscribed successfully.";
      if (replacesExisting === true) {
        successMessage = `We'll replace your old ${valueLabel} associated with this address with this new one.`;
      } else if (replacesExisting === false) {
        successMessage = `We'll add notifications for this address to your ${valueLabel}.`;
      }

      await onSubscribeSuccess?.(user_address);
      setLoading(false);
      showToasts &&
        toastSuccess({
          message: successMessage,
        });
      return true;
    } catch (error: any) {
      setLoading(false);
      showToasts &&
        toastError({
          message: "There was an error while subscribing. Please try again later.",
          messageToCopy: error.message,
        });
      return false;
    }
  };

  const checkIfValueExists = async ({
    value,
    displayToasts = true,
    userAddress,
  }: CheckIfValueExistsProps): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      return false;
    }

    setLoading(true);
    try {
      const check: SignupCheck = { kind, value, userAddress };
      const { exists } = await postJson<SignupCheckResult>("/api/signups/check", check);

      setLoading(false);
      return exists;
    } catch (error: any) {
      setLoading(false);
      displayToasts &&
        toastError({
          message: "There was an error while checking. Please try again later.",
          messageToCopy: error.message,
        });
      return false;
    }
  };

  return { subscribe, checkIfValueExists, isLoading };
};

export default useSignup;
