import React, { useRef, useState } from "react";
import { View, Text, TouchableWithoutFeedback, Keyboard } from "react-native";
import RNPhoneInput from "react-native-phone-number-input";

type PhoneValue = {
  raw: string;
  formatted: string;
  country: string;
  valid: boolean;
};

export default function PhoneInput({
  label,
  onChange,
  defaultValue,
}: {
  label?: string;
  onChange?: (value: PhoneValue) => void;
  defaultValue?: string;
}) {
  const phoneInputRef = useRef<RNPhoneInput>(null);
  const [phoneNumber, setPhoneNumber] = useState(defaultValue || "");
  const [formattedValue, setFormattedValue] = useState("");
  const [isValid, setIsValid] = useState(false);

  const handleValidation = (text: string) => {
    const checkValid = phoneInputRef.current?.isValidNumber(text) || false;
    const country = phoneInputRef.current?.getCountryCode() || "";
    setIsValid(checkValid);
    setPhoneNumber(text);
    onChange?.({ raw: text, formatted: formattedValue, country, valid: checkValid });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="mb-5 w-full">
        {label && <Text className="text-gray-500 mb-2 font-mulish">{label}</Text>}

        <View className="relative w-full">
          <RNPhoneInput
            ref={phoneInputRef}
            defaultCode="GH"
            layout="second"
            value={phoneNumber}
            onChangeText={handleValidation}
            onChangeFormattedText={(text) => setFormattedValue(text)}
            containerStyle={{
              width: "100%",
              borderWidth: 1,
              borderColor: "#E5E7EB",
              borderRadius: 12,
              backgroundColor: "#FFFFFF",
            }}
            textContainerStyle={{
              borderLeftWidth: 0,
              borderTopRightRadius: 12,
              borderBottomRightRadius: 12,
              backgroundColor:"#F3F4F6"
              
            }}
          />

          {phoneNumber.length > 0 && (
            <Text
              className={`absolute right-3 top-1/4  text-lg ${
                isValid ? "text-green-600" : "text-red-500"
              }`}
            >
              {isValid ? "✅" : "❌"}
            </Text>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
