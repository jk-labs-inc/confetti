import { useModal } from "@getpara/react-sdk-lite";
import { useCallback } from "react";
import { xClaimSheet } from "./store";

export const useClaimFirstSignIn = (chain: string | null = null) => {
  const { openModal } = useModal();

  return useCallback(() => {
    if (!xClaimSheet.pitch(chain)) openModal();
  }, [chain, openModal]);
};
