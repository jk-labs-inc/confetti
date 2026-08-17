"use client";

import { useModal } from "@getpara/react-sdk-lite";
import { useWallet } from "@hooks/useWallet";

const SignInModalTracker = () => {
  const { isOpen } = useModal();
  const { isConnected } = useWallet();

  if (!isOpen || isConnected) return null;

  return <div id="sign_in_modal" aria-hidden="true" className="pointer-events-none fixed inset-0" />;
};

export default SignInModalTracker;
