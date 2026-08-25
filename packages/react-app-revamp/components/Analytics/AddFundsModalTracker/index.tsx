"use client";

import { isFunkitConfigured } from "@config/funkit";
import { useEffect } from "react";

const ADD_FUNDS_MODAL_ID = "add_funds_modal";
const FUNKIT_CHECKOUT_MODAL_SELECTOR = '[data-testid="rk-checkout-modal"]';

const tagFunkitCheckoutModal = (root: ParentNode) => {
  const modal = root.querySelector<HTMLElement>(FUNKIT_CHECKOUT_MODAL_SELECTOR);
  if (modal && !modal.id) modal.id = ADD_FUNDS_MODAL_ID;
};

const AddFundsModalTracker = () => {
  useEffect(() => {
    if (!isFunkitConfigured) return;

    tagFunkitCheckoutModal(document.body);

    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement && node.hasAttribute("data-rk")) tagFunkitCheckoutModal(node);
        }
      }
    });
    observer.observe(document.body, { childList: true });

    return () => observer.disconnect();
  }, []);

  return null;
};

export default AddFundsModalTracker;
