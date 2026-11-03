import { useLogout } from "@getpara/react-sdk-lite";
import { useEmbeddedOnlySignIn } from "@hooks/useParaSignIn";
import { useCallback } from "react";

export const useSwitchAccount = () => {
  const { logoutAsync } = useLogout();
  const signIn = useEmbeddedOnlySignIn();

  return useCallback(async () => {
    await logoutAsync();
    signIn();
  }, [logoutAsync, signIn]);
};
