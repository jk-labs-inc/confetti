import { PhoneCountryCode, PhoneNumberValue } from "./types";

export const DEFAULT_PHONE_COUNTRY_CODE: PhoneCountryCode = "US";

export const EMPTY_PHONE_NUMBER: PhoneNumberValue = {
  countryCode: DEFAULT_PHONE_COUNTRY_CODE,
  nationalNumber: "",
};

export const e164PhoneRegex = /^\+[1-9]\d{1,14}$/;
