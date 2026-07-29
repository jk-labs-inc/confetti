import {
  AsYouType,
  getCountryCallingCode,
  getExampleNumber,
  parsePhoneNumberFromString,
  phoneExamples,
  validatePhoneNumberLength,
} from "./engine";
import { PhoneCountryCode, PhoneNumberValue } from "./types";

export { DEFAULT_PHONE_COUNTRY_CODE, EMPTY_PHONE_NUMBER, e164PhoneRegex } from "./constants";

export const formatNationalPhoneNumber = (value: PhoneNumberValue): string => {
  if (!value.nationalNumber) return "";

  return new AsYouType(value.countryCode).input(value.nationalNumber).replace(/[^\d]+$/, "");
};

export const isPhoneNumberEmpty = (value: PhoneNumberValue): boolean => value.nationalNumber.length === 0;

export const isValidPhoneNumber = (value: PhoneNumberValue): boolean =>
  parsePhoneNumberFromString(value.nationalNumber, value.countryCode)?.isValid() ?? false;

export const isPhoneNumberTooLong = (value: PhoneNumberValue): boolean =>
  validatePhoneNumberLength(value.nationalNumber, value.countryCode) === "TOO_LONG";

export const phoneNumberToE164 = (value: PhoneNumberValue): string =>
  parsePhoneNumberFromString(value.nationalNumber, value.countryCode)?.number ?? "";

export const resolvePhoneNumberInput = (input: string, currentCountry: PhoneCountryCode): PhoneNumberValue => {
  const trimmed = input.trim();

  if (!trimmed.includes("+")) {
    return { countryCode: currentCountry, nationalNumber: input.replace(/\D/g, "") };
  }

  const parsed = parsePhoneNumberFromString(trimmed);
  if (parsed) {
    const keepCurrent = parsed.countryCallingCode === getCountryCallingCode(currentCountry);
    return {
      countryCode: keepCurrent ? currentCountry : (parsed.country ?? currentCountry),
      nationalNumber: parsed.nationalNumber,
    };
  }

  // partial international input ("+49 15…") that doesn't parse as a complete number yet
  const formatter = new AsYouType();
  formatter.input(trimmed);
  const partial = formatter.getNumber();
  return {
    countryCode: partial?.country ?? currentCountry,
    nationalNumber: partial?.nationalNumber ?? "",
  };
};

export const getPhonePlaceholder = (countryCode: PhoneCountryCode): string =>
  getExampleNumber(countryCode, phoneExamples)?.formatNational() ?? "";
