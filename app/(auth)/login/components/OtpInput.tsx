import React, { useRef, useState } from "react";
import {
  View,
  TextInput,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";

interface OtpInputProps {
  length?: number;
  onCodeFilled?: (code: string) => void;
  error?: boolean;
}

export default function OtpInput({
  length = 5,
  onCodeFilled,
  error,
}: OtpInputProps) {
  const inputs = useRef<(TextInput | null)[]>([]);
  const [values, setValues] = useState<string[]>(Array(length).fill(""));

  const handleChange = (text: string, index: number) => {
    const newValues = [...values];
    newValues[index] = text;
    setValues(newValues);

    if (text && index < length - 1) inputs.current[index + 1]?.focus();
    if (!text && index > 0) inputs.current[index - 1]?.focus();

    const code = newValues.join("");
    if (code.length === length && !newValues.includes("")) {
      onCodeFilled?.(code);
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === "Backspace" && !values[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View className="flex-row justify-center gap-3 mb-4">
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          ref={(ref) => {
            inputs.current[i] = ref;
          }}
          className={`w-14 h-14 rounded-2xl pb-1 text-center text-xl font-bold 
            bg-white border shadow-sm
            ${error ? "border-red-500" : "border-gray-300"}`}
          maxLength={1}
          keyboardType="numeric"
          value={values[i]}
          onChangeText={(t) => handleChange(t, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
        />
      ))}
    </View>
  );
}
