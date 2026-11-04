"use client";

import { useModal } from "@getpara/react-sdk-lite";
import { useParaSignInStore } from "@hooks/useParaSignIn/store";
import { FC, useEffect } from "react";

const ParaSignInModeReset: FC = () => {
  const { isOpen } = useModal();
  const setIsEmbeddedOnly = useParaSignInStore(state => state.setIsEmbeddedOnly);

  useEffect(() => {
    if (!isOpen) setIsEmbeddedOnly(false);
  }, [isOpen, setIsEmbeddedOnly]);

  return null;
};

export default ParaSignInModeReset;
