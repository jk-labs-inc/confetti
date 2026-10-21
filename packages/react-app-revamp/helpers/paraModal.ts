const PARA_MODAL_SELECTOR = '[data-para-role="modal"]';

export const isParaModalShown = () => document.querySelector(PARA_MODAL_SELECTOR) !== null;
