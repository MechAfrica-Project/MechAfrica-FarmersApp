import { useRef, useState } from "react";
import {
  View,
  TextInput,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";

export default function OtpInput({
  length = 5,
  onCodeFilled,
  error,
}: {
  length?: number;
  onCodeFilled?: (code: string) => void;
  error?: boolean;
}) {
  const inputs = useRef<(TextInput | null)[]>([]);
  const [values, setValues] = useState<string[]>(Array(length).fill(""));

  const handleChange = (text: string, index: number) => {
    const newValues = [...values];
    newValues[index] = text;
    setValues(newValues);

    if (text && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }

    if (!text && index > 0) {
      inputs.current[index - 1]?.focus();
    }

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
    <View className="flex-row justify-between mx-2 mb-3">
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputs.current[index] = ref;
          }}
          className={`w-14 h-14 rounded-xl border text-center text-lg font-bold bg-gray-color/5 ${
            error ? "border-red-500" : "border-gray-color/40"
          }`}
          maxLength={1}
          keyboardType="numeric"
          value={values[index]}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
        />
      ))}
    </View>
  );
}
