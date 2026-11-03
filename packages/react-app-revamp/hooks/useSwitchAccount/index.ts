import { useLogout, useModal } from "@getpara/react-sdk-lite";
import { useCallback } from "react";

export const useSwitchAccount = () => {
  const { logoutAsync } = useLogout();
  const { openModal } = useModal();

  return useCallback(async () => {
    await logoutAsync();
    openModal();
  }, [logoutAsync, openModal]);
};
