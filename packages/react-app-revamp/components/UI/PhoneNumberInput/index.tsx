import { formatNationalPhoneNumber, parseNationalDigits } from "lib/phone";
import { getPhoneCountry } from "lib/phone/countries";
import { PhoneNumberValue } from "lib/phone/types";
import { FC, useLayoutEffect, useRef } from "react";

interface PhoneNumberInputProps {
  value: PhoneNumberValue;
  id?: string;
  inputClassName?: string;
  onChange: (value: PhoneNumberValue) => void;
}

const countDigits = (value: string) => value.replace(/\D/g, "").length;

// caret index right after the nth digit of the formatted string
const caretPositionForDigitCount = (formatted: string, digitCount: number) => {
  if (digitCount <= 0) return 0;

  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) {
      seen++;
      if (seen === digitCount) return i + 1;
    }
  }

  return formatted.length;
};

const PhoneNumberInput: FC<PhoneNumberInputProps> = ({ value, id, inputClassName, onChange }) => {
  const country = getPhoneCountry(value.countryCode);
  const inputRef = useRef<HTMLInputElement>(null);
  const caretDigitCountRef = useRef<number | null>(null);
  const selectionBeforeEditRef = useRef<{ start: number; end: number } | null>(null);
  const formattedValue = formatNationalPhoneNumber(value);

  // reformatting a controlled input throws the caret to the end; put it back after the same digit
  useLayoutEffect(() => {
    const digitCount = caretDigitCountRef.current;
    if (digitCount === null || !inputRef.current || document.activeElement !== inputRef.current) {
      caretDigitCountRef.current = null;
      return;
    }

    const caret = caretPositionForDigitCount(formattedValue, digitCount);
    inputRef.current.setSelectionRange(caret, caret);
    caretDigitCountRef.current = null;
  }, [value, formattedValue]);

  const handleBeforeInput = (event: React.FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    selectionBeforeEditRef.current =
      input.selectionStart === null || input.selectionEnd === null
        ? null
        : { start: input.selectionStart, end: input.selectionEnd };
  };

  const handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const raw = input.value;
    const caret = input.selectionStart ?? raw.length;
    const inputType = (event.nativeEvent as InputEvent).inputType;
    const selectionBeforeEdit = selectionBeforeEditRef.current;
    const wasCaretEdit = selectionBeforeEdit === null || selectionBeforeEdit.start === selectionBeforeEdit.end;
    selectionBeforeEditRef.current = null;
    let digitsBeforeCaret = countDigits(raw.slice(0, caret));
    let nationalNumber = parseNationalDigits(raw, value.countryCode);

    // the number is already full — reject the edit instead of silently dropping trailing digits
    if (nationalNumber.length > country.nationalNumberLength) {
      const digitsAdded = nationalNumber.length - value.nationalNumber.length;
      const restoredCaret = caretPositionForDigitCount(formattedValue, Math.max(digitsBeforeCaret - digitsAdded, 0));
      input.value = formattedValue;
      input.setSelectionRange(restoredCaret, restoredCaret);
      return;
    }

    // a single-char caret deletion that removed only a formatting char leaves the digits untouched — delete the
    // adjacent digit instead; deleting a selected formatting char just reformats
    if (raw.length === formattedValue.length - 1 && nationalNumber === value.nationalNumber && wasCaretEdit) {
      if (inputType === "deleteContentBackward" && digitsBeforeCaret > 0) {
        nationalNumber = nationalNumber.slice(0, digitsBeforeCaret - 1) + nationalNumber.slice(digitsBeforeCaret);
        digitsBeforeCaret -= 1;
      } else if (inputType === "deleteContentForward") {
        nationalNumber = nationalNumber.slice(0, digitsBeforeCaret) + nationalNumber.slice(digitsBeforeCaret + 1);
      }
    }

    caretDigitCountRef.current = Math.min(digitsBeforeCaret, nationalNumber.length);
    onChange({ countryCode: value.countryCode, nationalNumber });
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <span className="flex items-center gap-1 text-[16px] text-neutral-11 shrink-0">
        <span>{country.flag}</span>
        <span>{country.dialCode}</span>
      </span>
      <input
        ref={inputRef}
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={formattedValue}
        onBeforeInput={handleBeforeInput}
        onChange={handleNumberChange}
        className={`w-full bg-transparent text-[16px] outline-none text-ellipsis text-neutral-11 ${inputClassName ?? ""}`}
        placeholder={country.placeholder}
      />
    </div>
  );
};

export default PhoneNumberInput;
