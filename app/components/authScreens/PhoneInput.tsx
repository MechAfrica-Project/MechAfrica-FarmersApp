import { useRef, useState } from "react";
import { View, Text, TouchableWithoutFeedback, Keyboard } from "react-native";
import RNPhoneInput from "react-native-phone-number-input";

type PhoneValue = {
  raw: string;
  formatted: string;
  country: string;
  valid: boolean;
};

type PhoneInputProps = {
  label?: string;
  onChange?: (value: PhoneValue) => void;
  defaultValue?: string;
};

export default function PhoneInput({
  label,
  onChange,
  defaultValue,
}: PhoneInputProps) {
  const phoneInputRef = useRef<RNPhoneInput>(null);
  const [phoneNumber, setPhoneNumber] = useState(defaultValue || "");
  const [formattedValue, setFormattedValue] = useState("");
  const [isValid, setIsValid] = useState(false);

  const handleValidation = (text: string) => {
    const checkValid = phoneInputRef.current?.isValidNumber(text) || false;
    const country = phoneInputRef.current?.getCountryCode() || "";

    setIsValid(checkValid);
    setPhoneNumber(text);

    onChange?.({
      raw: text,
      formatted: formattedValue,
      country,
      valid: checkValid,
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="mb-5">
        {label && <Text className="text-gray-color mb-2 text-sm font-medium">{label}</Text>}

        <View className="relative w-full">
          {/* @ts-ignore */}
          <RNPhoneInput
            ref={phoneInputRef}
            defaultCode="GH"
            layout="first"
            value={phoneNumber}
            onChangeText={handleValidation}
            onChangeFormattedText={(text) => setFormattedValue(text)}
            containerStyle={{
              width: "100%",
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 12,
              backgroundColor: "#fff",
            }}
            textContainerStyle={{
              borderLeftWidth: 0,
              borderTopRightRadius: 12,
              borderBottomRightRadius: 12,
              backgroundColor: "#fff",
            }}
            withShadow
          />

          {/* ✅ / ❌ symbols */}
          {phoneNumber.length > 0 && (
            <Text
              className={`absolute right-3 top-1/2 -translate-y-3 text-lg ${
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
