import { CountryCode } from "libphonenumber-js";

export type Country = {
  code: CountryCode;   // strictly ISO country codes
  name: string;
  dialCode: string;
  flag: string;
  numberLength: number; // digits without leading 0
};

export const COUNTRIES: Country[] = [
  {
    code: "GH", // Ghana
    name: "Ghana",
    dialCode: "+233",
    flag: "🇬🇭",
    numberLength: 9,
  },
  // Only Ghana is supported for now per product requirement
];
