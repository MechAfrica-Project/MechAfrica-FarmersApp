declare module "react-native-phone-number-input" {
  import * as React from "react";
  import { ViewStyle, TextStyle, TextInputProps } from "react-native";

  export interface PhoneInputProps {
    defaultCode?: string;
    layout?: "first" | "second";
    value?: string;
    onChangeText?: (text: string) => void;
    onChangeFormattedText?: (text: string) => void;
    containerStyle?: ViewStyle;
    textContainerStyle?: ViewStyle;
    textInputStyle?: TextStyle;
    withShadow?: boolean;
    withDarkTheme?: boolean;
    textInputProps?: TextInputProps;
  }

  export default class PhoneInput extends React.Component<PhoneInputProps> {
    isValidNumber: (text: string) => boolean;
    getCountryCode: () => string;
  }
}
