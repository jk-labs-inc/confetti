import { PhoneCountry, PhoneCountryCode } from "./types";

// add new countries here; the rest of the phone signup flow is country-agnostic
export const PHONE_COUNTRIES: PhoneCountry[] = [
  {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    dialCode: "+1",
    nationalNumberLength: 10,
    // NANP: area code and exchange code cannot start with 0 or 1
    validationRegex: /^[2-9]\d{2}[2-9]\d{6}$/,
    formatPattern: "(###) ###-####",
    placeholder: "(201) 555-0123",
  },
];

export const DEFAULT_PHONE_COUNTRY = PHONE_COUNTRIES[0];

export const getPhoneCountry = (code: PhoneCountryCode): PhoneCountry =>
  PHONE_COUNTRIES.find(country => country.code === code) ?? DEFAULT_PHONE_COUNTRY;
