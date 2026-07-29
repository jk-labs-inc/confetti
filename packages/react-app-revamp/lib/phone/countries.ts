import { DEFAULT_PHONE_COUNTRY_CODE } from "./constants";
import { getCountries, getCountryCallingCode } from "./engine";
import { PhoneCountry, PhoneCountryCode } from "./types";

const countryCodeToFlagEmoji = (code: string): string =>
  code.toUpperCase().replace(/./g, char => String.fromCodePoint(0x1f1a5 + char.charCodeAt(0)));

// codes libphonenumber supports but CLDR has no display name for
const COUNTRY_NAME_OVERRIDES: Partial<Record<PhoneCountryCode, string>> = {
  AC: "Ascension Island",
  TA: "Tristan da Cunha",
  XK: "Kosovo",
};

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
const collator = new Intl.Collator("en");

export const PHONE_COUNTRIES: PhoneCountry[] = getCountries()
  .map(code => ({
    code,
    name: COUNTRY_NAME_OVERRIDES[code] ?? regionNames.of(code) ?? code,
    flag: countryCodeToFlagEmoji(code),
    dialCode: `+${getCountryCallingCode(code)}`,
  }))
  .sort((a, b) => collator.compare(a.name, b.name));

const PHONE_COUNTRY_BY_CODE = new Map(PHONE_COUNTRIES.map(country => [country.code, country]));

export const DEFAULT_PHONE_COUNTRY: PhoneCountry =
  PHONE_COUNTRY_BY_CODE.get(DEFAULT_PHONE_COUNTRY_CODE) ?? PHONE_COUNTRIES[0];

export const getPhoneCountry = (code: PhoneCountryCode): PhoneCountry =>
  PHONE_COUNTRY_BY_CODE.get(code) ?? DEFAULT_PHONE_COUNTRY;
