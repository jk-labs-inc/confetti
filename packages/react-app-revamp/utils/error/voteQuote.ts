export class VoteQuoteOutdatedError extends Error {
  constructor() {
    super("the price per vote changed since these votes were quoted");
    this.name = "VoteQuoteOutdatedError";
  }
}
