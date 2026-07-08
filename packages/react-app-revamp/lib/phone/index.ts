import { DEFAULT_PHONE_COUNTRY, getPhoneCountry } from "./countries";
import { PhoneNumberValue } from "./types";

export const EMPTY_PHONE_NUMBER: PhoneNumberValue = {
  countryCode: DEFAULT_PHONE_COUNTRY.code,
  nationalNumber: "",
};

export const e164PhoneRegex = /^\+[1-9]\d{1,14}$/;

/**
 * Extracts the national digits from arbitrary user input (typing or paste),
 * dropping formatting characters and a leading dial code if present.
 * May return more digits than the country allows — callers decide how to handle overflow.
 */
export const parseNationalDigits = (input: string, countryCode: PhoneNumberValue["countryCode"]): string => {
  const country = getPhoneCountry(countryCode);
  const dialCodeDigits = country.dialCode.replace(/\D/g, "");
  let digits = input.replace(/\D/g, "");

  const hasDialCodePrefix = digits.startsWith(dialCodeDigits) && digits.length > country.nationalNumberLength;
  if ((input.trim().startsWith("+") || hasDialCodePrefix) && digits.startsWith(dialCodeDigits)) {
    digits = digits.slice(dialCodeDigits.length);
  }

  return digits;
};

export const formatNationalPhoneNumber = (value: PhoneNumberValue): string => {
  const country = getPhoneCountry(value.countryCode);
  const digits = value.nationalNumber;

  if (!digits) return "";

  let formatted = "";
  let digitIndex = 0;

  for (const char of country.formatPattern) {
    if (digitIndex >= digits.length) break;

    if (char === "#") {
      formatted += digits[digitIndex];
      digitIndex++;
    } else {
      formatted += char;
    }
  }

  // append any overflow digits so nothing the user typed disappears
  formatted += digits.slice(digitIndex);

  return formatted.replace(/[^\d]+$/, "");
};

export const isPhoneNumberEmpty = (value: PhoneNumberValue): boolean => value.nationalNumber.length === 0;

export const isValidPhoneNumber = (value: PhoneNumberValue): boolean =>
  getPhoneCountry(value.countryCode).validationRegex.test(value.nationalNumber);

export const phoneNumberToE164 = (value: PhoneNumberValue): string =>
  `${getPhoneCountry(value.countryCode).dialCode}${value.nationalNumber}`;
