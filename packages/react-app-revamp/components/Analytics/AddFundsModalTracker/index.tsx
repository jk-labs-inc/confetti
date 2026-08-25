"use client";

import { isFunkitConfigured } from "@config/funkit";
import { useEffect } from "react";

const ADD_FUNDS_MODAL_ID = "add_funds_modal";
const FUNKIT_CHECKOUT_MODAL_SELECTOR = 'body > [data-rk] [data-testid="rk-checkout-modal"]';

const tagFunkitCheckoutModal = () => {
  const modal = document.querySelector<HTMLElement>(FUNKIT_CHECKOUT_MODAL_SELECTOR);
  if (modal && !modal.id) modal.id = ADD_FUNDS_MODAL_ID;
};

const AddFundsModalTracker = () => {
  useEffect(() => {
    if (!isFunkitConfigured) return;

    tagFunkitCheckoutModal();

    const observer = new MutationObserver(() => tagFunkitCheckoutModal());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
};

export default AddFundsModalTracker;
