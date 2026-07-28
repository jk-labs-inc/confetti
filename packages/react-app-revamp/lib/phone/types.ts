import type { CountryCode } from "./engine";

export type PhoneCountryCode = CountryCode;

export interface PhoneCountry {
  code: PhoneCountryCode;
  name: string;
  flag: string;
  dialCode: string;
}

export interface PhoneNumberValue {
  countryCode: PhoneCountryCode;
  nationalNumber: string;
}
