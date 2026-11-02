import { useLogout, useModal } from "@getpara/react-sdk-lite";
import { useCallback } from "react";
import { useParaSignInStore } from "./store";

export const useEmbeddedOnlySignIn = () => {
  const { openModal } = useModal();
  const setIsEmbeddedOnly = useParaSignInStore(state => state.setIsEmbeddedOnly);

  return useCallback(() => {
    setIsEmbeddedOnly(true);
    openModal();
  }, [openModal, setIsEmbeddedOnly]);
};

export const useSwitchToEmbeddedSignIn = () => {
  const { logoutAsync } = useLogout();
  const signIn = useEmbeddedOnlySignIn();

  return useCallback(async () => {
    await logoutAsync();
    signIn();
  }, [logoutAsync, signIn]);
};
