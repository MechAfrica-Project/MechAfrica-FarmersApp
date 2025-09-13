declare module "google-libphonenumber" {
  export class PhoneNumberUtil {
    static getInstance(): PhoneNumberUtil;
    parse(phoneNumber: string, regionCode?: string): any;
    isValidNumber(number: any): boolean;
  }

  export class AsYouTypeFormatter {
    constructor(regionCode: string);
    inputDigit(digit: string): string;
  }

  export enum PhoneNumberFormat {
    INTERNATIONAL,
    NATIONAL,
    E164,
    RFC3966,
  }
}
