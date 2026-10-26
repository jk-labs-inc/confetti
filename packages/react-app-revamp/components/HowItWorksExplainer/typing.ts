const TYPE_CHAR_S = 0.2;

export const typedPrefix = (t: number, text: string, startS: number) =>
  t < startS ? "" : text.slice(0, Math.floor((t - startS) / TYPE_CHAR_S) + 1);

export const typingDoneAt = (text: string, startS: number) => startS + (text.length - 1) * TYPE_CHAR_S;

export const TYPE_AT_S = 0.6;
const POP_AFTER_TYPING_S = 0.3;
const HOLD_AFTER_POP_S = 2.4;
const STILL_AFTER_POP_S = 0.6;

interface TypingBeats {
  typeAt: number;
  popAt: number;
  durationS: number;
  stillS: number;
}

export const typingBeats = (text: string): TypingBeats => {
  const popAt = typingDoneAt(text, TYPE_AT_S) + POP_AFTER_TYPING_S;
  return { typeAt: TYPE_AT_S, popAt, durationS: popAt + HOLD_AFTER_POP_S, stillS: popAt + STILL_AFTER_POP_S };
};
