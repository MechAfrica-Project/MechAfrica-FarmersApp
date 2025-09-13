// components/FooterNote.tsx
import React from "react";
import { View, Text } from "react-native";

type Props = {
  /** When true the text is shown. Defaults to false (hidden). */
  showText?: boolean;
  message?: string;
};

export default function FooterNote({ showText = false, message }: Props) {
  return (
    <View className="py-4 h-[8rem] bg-light-yellow flex flex-col pb-12 justify-center align-middle w-full">
      {showText ? (
        <Text className="text-gray-color font-mulish text-center">
          {message ??
            "By using MechAfrica, you agree to the\nTerms and Privacy Policy."}
        </Text>
      ) : null}
    </View>
  );
}
