declare module "react-native-intl-phone-input" {
  import * as React from "react";
  import {
    ViewStyle,
    TextStyle,
    ImageStyle,
    FlatListProps,
    TextInputProps,
  } from "react-native";

  /** Shape of the value returned on change */
  export interface PhoneInputParams {
    phoneNumber: string; // full raw number string
    dialCode: string; // e.g. "+233"
    unmaskedPhoneNumber: string; // digits only
    isVerified: boolean; // if passes validation
  }

  /** Component props */
  export interface PhoneInputProps {
    /** Default country code (e.g. "GH", "US") */
    defaultCountry?: string;

    /** Current value */
    value?: string;

    /** Called when the phone input changes */
    onChangeText?: (params: PhoneInputParams) => void;

    /** Called when the country changes */
    onChangeCountry?: (country: {
      code: string;
      dialCode: string;
      flag: string;
    }) => void;

    /** Custom placeholder */
    placeholder?: string;

    /** Disable country selection */
    disableCountryChange?: boolean;

    /** Show only numbers in keyboard */
    numeric?: boolean;

    /** Customize validation (replace built-in) */
    customValidation?: (value: string) => boolean;

    /** Extra props for the TextInput */
    phoneInputProps?: TextInputProps;

    // ========== Styling ==========
    containerStyle?: ViewStyle;
    flagStyle?: ImageStyle;
    dialCodeTextStyle?: TextStyle;
    phoneInputStyle?: TextStyle;
    modalContainer?: ViewStyle;
    modalCountryItemStyle?: ViewStyle;
    modalCountryItemTextStyle?: TextStyle;
    filterInputStyle?: TextStyle;
    modalCloseButtonStyle?: ViewStyle;
    modalCloseTextStyle?: TextStyle;

    // ========== Modal ==========
    /** Modal title (defaults to "Select country") */
    modalTitle?: string;

    /** Text for close button */
    modalCloseButtonText?: string;

    /** FlatList props for country list */
    flatListProps?: Partial<FlatListProps<any>>;
  }

  /** Main component */
  export default class IntlPhoneInput extends React.Component<PhoneInputProps> {}
}
