export const X_CLAIM_IDS = {
  createWallet: "x_claim_create_wallet",
  signInExisting: "x_claim_sign_in_existing",
  connectX: "x_claim_connect_x",
  confirmX: "x_claim_confirm_x",
  signMessage: "x_claim_sign_message",
  linkedClaim: "x_claim_linked_claim",
  noSpotsClaim: "x_claim_no_spots_claim",
  modalClose: "x_claim_modal_close",
  maybeLater: "x_claim_maybe_later",
  close: "x_claim_close",
  done: "x_claim_done",
  successFindContest: "x_claim_success_find_contest",
  successBackToContest: "x_claim_success_back_to_contest",
  alreadyClaimedFindContest: "x_claim_already_claimed_find_contest",
  alreadyClaimedBackToContest: "x_claim_already_claimed_back_to_contest",
  checkAgain: "x_claim_check_again",
  addFunds: "x_claim_add_funds",
  alreadyLinkedGotIt: "x_claim_already_linked_got_it",
  noSpotsGotIt: "x_claim_no_spots_got_it",
  connectOtherX: "x_claim_connect_other_x",
  browseContests: "x_claim_browse_contests",
  payoutRetry: "x_claim_payout_retry",
  tryXAgain: "x_claim_try_x_again",
  contactUs: "x_claim_contact_us",
  accountMenuRow: "x_claim_account_menu_row",
  profileDrawerRow: "x_claim_profile_drawer_row",
  tipDismiss: "x_claim_tip_dismiss",
} as const;

export const X_CLAIM_ART = {
  ballot: { src: "/landing/bubbles-ballot.png", alt: "bubbles, the confetti mascot, dropping cash into a ballot box" },
  money: { src: "/landing/bubbles-money.png", alt: "bubbles celebrating in a rain of cash" },
  building: { src: "/contest/bubbles-under-construction.png", alt: "bubbles carefully stacking blocks" },
  shy: { src: "/entry/no-votes-bubbles.png", alt: "bubbles looking a little disappointed" },
} as const;

export type XClaimArt = keyof typeof X_CLAIM_ART;
