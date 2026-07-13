export type PhoneCountryCode = "US";

export interface PhoneCountry {
  code: PhoneCountryCode;
  name: string;
  flag: string;
  dialCode: string;
  // max amount of digits in the national number (without the dial code)
  nationalNumberLength: number;
  validationRegex: RegExp;
  // "#" placeholders are filled with national digits as the user types
  formatPattern: string;
  placeholder: string;
}

export interface PhoneNumberValue {
  countryCode: PhoneCountryCode;
  nationalNumber: string;
}
