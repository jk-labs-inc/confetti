import { toastError, toastLoading, toastSuccess } from "@components/UI/Toast";
import { supabase } from "@config/supabase";
import { isSupabaseConfigured } from "@helpers/database";
import moment from "moment";
import { useState } from "react";

interface CheckIfValueExistsProps {
  value: string;
  displayToasts?: boolean;
  userAddress?: string;
}

interface UseSignupConfig {
  tableName: string;
  valueColumn: string;
  valueLabel: string;
  onSubscribeSuccess?: (userAddress: string | null) => Promise<void>;
  upsertConflictColumn?: string;
}

const useSignup = ({
  tableName,
  valueColumn,
  valueLabel,
  onSubscribeSuccess,
  upsertConflictColumn,
}: UseSignupConfig) => {
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
      let successMessage = "You have been subscribed successfully.";

      if (user_address) {
        const { data: existingUser } = await supabase
          .from(tableName)
          .select(valueColumn)
          .eq("user_address", user_address);

        if (existingUser && existingUser.length > 0) {
          successMessage = `We'll replace your old ${valueLabel} associated with this address with this new one.`;
        } else {
          successMessage = `We'll add notifications for this address to your ${valueLabel}.`;
        }
      }

      const row = {
        [valueColumn]: value,
        user_address,
        date: moment().toISOString(),
      };

      const { error } = upsertConflictColumn
        ? await supabase.from(tableName).upsert([row], { onConflict: upsertConflictColumn })
        : await supabase.from(tableName).insert([row]);

      if (error) {
        setLoading(false);
        showToasts &&
          toastError({
            message: "There was an error while subscribing. Please try again later.",
          });
        return false;
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
      let query = supabase.from(tableName).select(`${valueColumn}, user_address`).eq(valueColumn, value);

      if (userAddress) {
        query = query.eq("user_address", userAddress);
      }

      const { data, error } = await query;

      setLoading(false);
      if (error) {
        displayToasts &&
          toastError({
            message: "There was an error while checking. Please try again later.",
            messageToCopy: error.message,
          });
        return false;
      }
      return !!data?.length;
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
