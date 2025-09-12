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
      <View style={{ marginBottom: 20 }}>
        {label && <Text style={{ color: "#6b7280", marginBottom: 6 }}>{label}</Text>}

        <View style={{ position: "relative", width: "100%" }}>
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
          />
          {phoneNumber.length > 0 && (
            <Text style={{ position: "absolute", right: 12, top: "45%", transform: [{ translateY: -10 }], fontSize: 18, color: isValid ? "#16a34a" : "#ef4444" }}>
              {isValid ? "✅" : "❌"}
            </Text>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
